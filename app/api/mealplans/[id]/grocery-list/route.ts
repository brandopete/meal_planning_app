import { NextRequest, NextResponse } from 'next/server';
import { getMealPlan, getMealsForPlan } from '@/lib/db/firebase/meal-plans';
import { getRecipe } from '@/lib/db/firebase/recipes';
import { createGroceryList } from '@/lib/db/firebase/grocery-lists';
import { requireAuth } from '@/lib/auth/server';
import { generateGroceryList } from '@/lib/ai/generate-grocery-list';
import { z } from 'zod';
import type { Recipe, PantryItem } from '@/types';

// Validation schema
const generateGroceryListSchema = z.object({
  unit_system: z.enum(['imperial', 'metric']).default('imperial'),
  pantry_items: z.array(z.object({
    id: z.string(),
    item: z.string(),
    quantity: z.number(),
    unit: z.string(),
  })).optional().default([]),
});

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
    const validationResult = generateGroceryListSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { unit_system, pantry_items } = validationResult.data;

    // 1. Fetch the meal plan
    const { data: mealPlan, error: mealPlanError } = await getMealPlan(mealPlanId, user.uid);
    if (mealPlanError || !mealPlan) {
      return NextResponse.json(
        { error: mealPlanError?.message || 'Meal plan not found' },
        { status: mealPlanError?.message === 'Unauthorized' ? 403 : 404 }
      );
    }

    // 2. Fetch all meals for this meal plan
    const { data: meals, error: mealsError } = await getMealsForPlan(mealPlanId, user.uid);
    if (mealsError) {
      return NextResponse.json(
        { error: 'Failed to fetch meals' },
        { status: 500 }
      );
    }

    if (!meals || meals.length === 0) {
      return NextResponse.json(
        { error: 'No meals found in this meal plan' },
        { status: 400 }
      );
    }

    // 3. Fetch all recipes referenced by the meals
    const recipeIds = meals
      .map((meal) => meal.recipe_id)
      .filter((id): id is string => id !== null && id !== undefined);

    const recipesMap: Record<string, Recipe> = {};

    for (const recipeId of recipeIds) {
      const { data: recipe, error: recipeError } = await getRecipe(recipeId);
      if (!recipeError && recipe) {
        recipesMap[recipeId] = recipe;
      }
    }

    // 4. Generate the grocery list using OpenAI
    try {
      const groceryList = await generateGroceryList({
        mealPlanId,
        startDate: mealPlan.start_date,
        endDate: mealPlan.end_date,
        meals,
        recipes: recipesMap,
        pantryItems: pantry_items as PantryItem[],
        unitSystem: unit_system,
      });

      // 5. Save the grocery list to the database
      const { data: savedList, error: saveError } = await createGroceryList(
        mealPlanId,
        user.uid,
        groceryList
      );

      if (saveError) {
        console.error('Error saving grocery list:', saveError);
        return NextResponse.json(
          { error: 'Failed to save grocery list' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          grocery_list: savedList,
        },
        { status: 201 }
      );
    } catch (aiError) {
      console.error('Error generating grocery list with AI:', aiError);
      return NextResponse.json(
        {
          error: 'Failed to generate grocery list',
          details: aiError instanceof Error ? aiError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error in grocery list generation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
