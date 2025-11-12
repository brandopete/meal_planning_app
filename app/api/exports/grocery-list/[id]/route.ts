import { NextRequest, NextResponse } from 'next/server';
import { getGroceryList } from '@/lib/db/firebase/grocery-lists';
import { requireAuth } from '@/lib/auth/server';
import Papa from 'papaparse';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // Fetch the grocery list
    const { data: groceryList, error: groceryListError } = await getGroceryList(id, user.uid);

    if (groceryListError || !groceryList) {
      return NextResponse.json(
        { error: groceryListError?.message || 'Grocery list not found' },
        { status: groceryListError?.message === 'Unauthorized' ? 403 : 404 }
      );
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = groceryList.items.map((item) => ({
        'Item Name': item.display_name || item.name,
        'Quantity': item.quantity,
        'Unit': item.unit,
        'Category': item.category,
        'Estimated Price': item.estimated_price || '',
        'Notes': item.notes || '',
        'Optional': item.optional ? 'Yes' : 'No',
      }));

      const csv = Papa.unparse(csvData);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="grocery-list-${id}.csv"`,
        },
      });
    } else if (format === 'json') {
      // Return JSON format
      return new NextResponse(JSON.stringify(groceryList, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="grocery-list-${id}.json"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use ?format=json or ?format=csv' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error exporting grocery list:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
