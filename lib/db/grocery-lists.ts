import { supabase, handleSupabaseError } from './supabase';
import type { GroceryList } from '@/types';

export async function getGroceryList(id: string): Promise<{ data: GroceryList | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function getGroceryListByMealPlan(
  mealPlanId: string
): Promise<{ data: GroceryList | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('meal_plan_id', mealPlanId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Not found is not an error in this case
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function createGroceryList(
  groceryList: Omit<GroceryList, 'id' | 'created_at'>
): Promise<{ data: GroceryList | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .insert(groceryList)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function updateGroceryList(
  id: string,
  updates: Partial<Omit<GroceryList, 'id' | 'created_at'>>
): Promise<{ data: GroceryList | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('grocery_lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function deleteGroceryList(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('grocery_lists')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
}
