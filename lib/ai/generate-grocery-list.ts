import { openai, DEFAULT_MODEL } from './openai-client';
import { z } from 'zod';
import type { GroceryList, Recipe, Meal, PantryItem, UnitSystem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Zod schema for validating OpenAI's JSON response
const groceryItemSchema = z.object({
  name: z.string(),
  display_name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  quantity_in_grams: z.number().optional(),
  category: z.string(),
  notes: z.string().optional(),
  from_recipes: z.array(z.object({
    recipe_id: z.string(),
    meal_date: z.string(),
    servings: z.number(),
  })),
  estimated_price: z.number().optional(),
  store_suggestions: z.array(z.string()).optional(),
  optional: z.boolean(),
});

const groceryListResponseSchema = z.object({
  items: z.array(groceryItemSchema),
});

interface GenerateGroceryListParams {
  mealPlanId: string;
  startDate: string;
  endDate: string;
  meals: Meal[];
  recipes: Record<string, Recipe>; // recipe_id -> Recipe
  pantryItems: PantryItem[];
  unitSystem: UnitSystem;
}

export async function generateGroceryList(
  params: GenerateGroceryListParams
): Promise<GroceryList> {
  const { mealPlanId, startDate, endDate, meals, recipes, pantryItems, unitSystem } = params;

  // Build the meal plan data for the prompt
  const mealPlanData = {
    start: startDate,
    end: endDate,
    meals: meals.map((meal) => ({
      date: meal.date,
      meal_time: meal.meal_time,
      title: meal.title,
      recipe: meal.recipe_id && recipes[meal.recipe_id] ? recipes[meal.recipe_id] : null,
      description: meal.description,
      servings: meal.servings,
    })),
  };

  // Build the pantry data
  const pantryData = pantryItems.map((item) => ({
    item: item.item,
    quantity: item.quantity,
    unit: item.unit,
  }));

  // Create the system prompt
  const systemPrompt = `You are a grocery list generation assistant that MUST output only valid JSON conforming to the Grocery List Schema.

Your tasks:
1. Expand recipes into their ingredient lists and scale them by the requested servings
2. Normalize ingredient names and canonicalize units (use the unit_system: "${unitSystem}")
3. Merge duplicate ingredients and sum quantities
4. Categorize each item into a grocery category (produce, dairy, meat, spices, pantry, frozen, beverages, household, bakery, etc.)
5. Subtract pantry items from the grocery list where applicable
6. Provide estimated prices using internal heuristics (rough estimates in USD)

IMPORTANT RULES:
- Output ONLY a JSON object, nothing else
- Use canonical ingredient names in the "name" field
- Put brand names or specifics in "display_name" and "notes" fields
- When normalizing units for ${unitSystem === 'metric' ? 'metric' : 'imperial'} system, convert appropriately
- Mark inferred ingredients from freeform descriptions as optional: true
- Be conservative with price estimates; use null if uncertain

Return a JSON object with this exact structure:
{
  "items": [
    {
      "name": "canonical-name",
      "display_name": "Display Name",
      "quantity": number,
      "unit": "unit",
      "quantity_in_grams": number (optional),
      "category": "category",
      "notes": "optional notes",
      "from_recipes": [{"recipe_id": "id", "meal_date": "YYYY-MM-DD", "servings": number}],
      "estimated_price": number (optional),
      "store_suggestions": ["store names"] (optional),
      "optional": boolean
    }
  ]
}`;

  const userPrompt = `Generate a grocery list for this meal plan:

Meal Plan: ${JSON.stringify(mealPlanData, null, 2)}

Pantry Items (subtract these from grocery list): ${JSON.stringify(pantryData, null, 2)}

Unit System: ${unitSystem}

Return only the JSON object.`;

  try {
    // Call OpenAI API with JSON mode
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent outputs
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate the JSON response
    const parsedResponse = JSON.parse(content);
    const validationResult = groceryListResponseSchema.safeParse(parsedResponse);

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error);
      throw new Error('Invalid response format from OpenAI');
    }

    // Add IDs to items and keep snake_case
    const items = validationResult.data.items.map((item) => ({
      id: uuidv4(),
      name: item.name,
      display_name: item.display_name,
      quantity: item.quantity,
      unit: item.unit,
      quantity_in_grams: item.quantity_in_grams,
      category: item.category,
      notes: item.notes,
      from_recipes: item.from_recipes.map(source => ({
        recipe_id: source.recipe_id,
        meal_date: source.meal_date,
        servings: source.servings,
      })),
      estimated_price: item.estimated_price,
      store_suggestions: item.store_suggestions,
      optional: item.optional,
    }));

    const totalEstimatedCost = items.reduce(
      (sum, item) => sum + (item.estimated_price || 0),
      0
    );

    const groceryList: GroceryList = {
      id: uuidv4(),
      meal_plan_id: mealPlanId,
      meta: {
        generated_at: new Date().toISOString(),
        date_range: {
          start: startDate,
          end: endDate,
        },
        servings_scale: 1.0,
        unit_system: unitSystem,
      },
      items,
      summary: {
        total_items: items.length,
        estimated_total: totalEstimatedCost > 0 ? totalEstimatedCost : undefined,
      },
    };

    return groceryList;
  } catch (error) {
    console.error('Error generating grocery list with OpenAI:', error);
    throw new Error(`Failed to generate grocery list: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
