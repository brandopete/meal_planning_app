import { supabase, handleSupabaseError } from './supabase';
import type { MealPlan, Meal } from '@/types';

export async function getMealPlan(id: string): Promise<{ data: MealPlan | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function createMealPlan(
  mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: MealPlan | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert(mealPlan)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function updateMealPlan(
  id: string,
  updates: Partial<Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: MealPlan | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
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

export async function deleteMealPlan(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
}

export async function getMealsForPlan(planId: string): Promise<{ data: Meal[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('meal_plan_id', planId)
      .order('date', { ascending: true })
      .order('meal_time', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function createMeal(
  meal: Omit<Meal, 'id'>
): Promise<{ data: Meal | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('meals')
      .insert(meal)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: handleSupabaseError(error) };
  }
}

export async function updateMeal(
  id: string,
  updates: Partial<Omit<Meal, 'id'>>
): Promise<{ data: Meal | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('meals')
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

export async function deleteMeal(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: handleSupabaseError(error) };
  }
}
