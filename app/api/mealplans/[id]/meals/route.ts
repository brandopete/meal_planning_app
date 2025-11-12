import { NextRequest, NextResponse } from 'next/server';
import { getMealsForPlan, createMeal } from '@/lib/db/firebase/meal-plans';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for creating meals
const createMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_time: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'custom']),
  title: z.string().min(1),
  recipe_id: z.string().optional(),
  description: z.string().optional(),
  servings: z.number().int().positive().default(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { id: mealPlanId } = await params;

    const { data, error } = await getMealsForPlan(mealPlanId, user.uid);

    if (error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching meals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth();
    const { id: mealPlanId } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = createMealSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const mealData = validationResult.data;

    // Create meal
    const { data, error } = await createMeal(mealPlanId, user.uid, {
      date: mealData.date,
      mealTime: mealData.meal_time,
      title: mealData.title,
      recipeId: mealData.recipe_id || null,
      description: mealData.description || null,
      servings: mealData.servings,
    });

    if (error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating meal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
