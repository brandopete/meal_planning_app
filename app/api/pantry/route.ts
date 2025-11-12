import { NextRequest, NextResponse } from 'next/server';
import { getAllPantryItems, createPantryItem } from '@/lib/db/firebase/pantry';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for creating pantry items
const createPantryItemSchema = z.object({
  item: z.string().min(1),
  quantity: z.number().nonnegative(),
  unit: z.string().min(1),
});

export async function GET() {
  try {
    // Require authentication
    const user = await requireAuth();

    const { data, error } = await getAllPantryItems(user.uid);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    const body = await request.json();

    // Validate request body
    const validationResult = createPantryItemSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const itemData = validationResult.data;

    // Create pantry item
    const { data, error } = await createPantryItem(user.uid, itemData);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating pantry item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
