import { NextRequest, NextResponse } from 'next/server';
import { getGroceryList } from '@/lib/db/grocery-lists';
import { z } from 'zod';
import type { BudgetEstimate } from '@/types';

// Validation schema
const priceEstimateSchema = z.object({
  grocery_list_id: z.string().uuid(),
  store: z.string().optional(),
  manual_overrides: z.record(z.string(), z.number()).optional(), // item_id -> price
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = priceEstimateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { grocery_list_id, store, manual_overrides } = validationResult.data;

    // Fetch the grocery list
    const { data: groceryList, error: groceryListError } = await getGroceryList(grocery_list_id);

    if (groceryListError || !groceryList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Build the budget estimate
    const items = groceryList.items.map((item) => {
      // Use manual override if provided, otherwise use estimated price, otherwise 0
      const price = manual_overrides?.[item.id] ?? item.estimated_price ?? 0;

      return {
        item_id: item.id,
        name: item.display_name || item.name,
        quantity: item.quantity,
        unit: item.unit,
        estimated_price: price,
        store,
      };
    });

    // Calculate category subtotals
    const categorySubtotals: Record<string, number> = {};

    for (const groceryItem of groceryList.items) {
      const category = groceryItem.category;
      const price = manual_overrides?.[groceryItem.id] ?? groceryItem.estimated_price ?? 0;

      if (!categorySubtotals[category]) {
        categorySubtotals[category] = 0;
      }

      categorySubtotals[category] += price;
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.estimated_price, 0);
    const taxRate = 0.0825; // 8.25% tax (configurable)
    const taxEstimate = subtotal * taxRate;
    const grandTotal = subtotal + taxEstimate;

    const budget: BudgetEstimate = {
      grocery_list_id,
      items,
      category_subtotals: categorySubtotals,
      tax_estimate: taxEstimate,
      grand_total: grandTotal,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        budget,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating price estimate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
