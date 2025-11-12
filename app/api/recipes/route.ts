import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, createRecipe } from '@/lib/db/firebase/recipes';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for recipe ingredients
const ingredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
  preparation: z.string().optional(),
  optional: z.boolean().optional(),
});

// Validation schema for creating recipes
const createRecipeSchema = z.object({
  title: z.string().min(1),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export async function GET() {
  try {
    const { data, error } = await getAllRecipes();

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for creating recipes
    await requireAuth();

    const body = await request.json();

    // Validate request body
    const validationResult = createRecipeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const recipeData = validationResult.data;

    // Create recipe with proper ingredient structure
    const { data, error } = await createRecipe({
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions || '',
      url: recipeData.url || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
