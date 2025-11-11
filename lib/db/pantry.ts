import { supabase, handleSupabaseError } from './supabase';
import type { PantryItem } from '@/types';

export async function getAllPantryItems(): Promise<{ data: PantryItem[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .order('item', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function getPantryItem(id: string): Promise<{ data: PantryItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function createPantryItem(
  item: Omit<PantryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: PantryItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function updatePantryItem(
  id: string,
  updates: Partial<Omit<PantryItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: PantryItem | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pantry_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function deletePantryItem(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
}
