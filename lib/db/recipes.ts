import { supabase, handleSupabaseError } from './supabase';
import type { Recipe } from '@/types';

export async function getAllRecipes(): Promise<{ data: Recipe[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('title', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function getRecipe(id: string): Promise<{ data: Recipe | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function createRecipe(
  recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Recipe | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function updateRecipe(
  id: string,
  updates: Partial<Omit<Recipe, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Recipe | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('recipes')
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

export async function deleteRecipe(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
}
