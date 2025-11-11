import { NextRequest, NextResponse } from 'next/server';
import { getMealsForPlan, createMeal } from '@/lib/db/meal-plans';
import { z } from 'zod';

// Validation schema for creating meals
const createMealSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal_time: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'custom']),
  title: z.string().min(1),
  recipe_id: z.string().uuid().optional(),
  description: z.string().optional(),
  servings: z.number().int().positive().default(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mealPlanId } = await params;

    const { data, error } = await getMealsForPlan(mealPlanId);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
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
    const { data, error } = await createMeal({
      ...mealData,
      meal_plan_id: mealPlanId,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error creating meal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
