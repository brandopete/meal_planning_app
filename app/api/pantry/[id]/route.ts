import { NextRequest, NextResponse } from 'next/server';
import { getPantryItem, updatePantryItem, deletePantryItem } from '@/lib/db/pantry';
import { z } from 'zod';

// Validation schema for updating pantry items
const updatePantryItemSchema = z.object({
  item: z.string().min(1).optional(),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().min(1).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await getPantryItem(id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Pantry item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pantry item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = updatePantryItemSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updates = validationResult.data;

    // Update pantry item
    const { data, error } = await updatePantryItem(id, updates);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Pantry item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating pantry item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { success, error } = await deletePantryItem(id);

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    if (!success) {
      return NextResponse.json(
        { error: 'Pantry item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
