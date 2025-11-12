import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { MealPlan, Meal } from '@/types';

// Meal Plans

export async function getMealPlan(planId: string, userId: string) {
  try {
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    const planData = planSnap.data();

    // Verify ownership
    if (planData.user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealPlan: MealPlan = {
      id: planSnap.id,
      user_id: planData.user_id,
      start_date: planData.start_date.toDate().toISOString().split('T')[0],
      end_date: planData.end_date.toDate().toISOString().split('T')[0],
      created_at: planData.created_at?.toDate().toISOString(),
      updated_at: planData.updated_at?.toDate().toISOString(),
    };

    return { data: mealPlan, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createMealPlan(
  userId: string,
  startDate: string,
  endDate: string
) {
  try {
    const mealPlansRef = collection(db, 'mealPlans');
    const docRef = await addDoc(mealPlansRef, {
      user_id: userId,
      start_date: Timestamp.fromDate(new Date(startDate)),
      end_date: Timestamp.fromDate(new Date(endDate)),
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const newPlan = await getDoc(docRef);
    const planData = newPlan.data()!;

    const mealPlan: MealPlan = {
      id: docRef.id,
      user_id: planData.user_id,
      start_date: planData.start_date.toDate().toISOString().split('T')[0],
      end_date: planData.end_date.toDate().toISOString().split('T')[0],
      created_at: planData.created_at?.toDate().toISOString(),
      updated_at: planData.updated_at?.toDate().toISOString(),
    };

    return { data: mealPlan, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateMealPlan(
  planId: string,
  userId: string,
  updates: { startDate?: string; endDate?: string }
) {
  try {
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    if (planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const updateData: any = {
      updated_at: serverTimestamp(),
    };

    if (updates.startDate) {
      updateData.start_date = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      updateData.end_date = Timestamp.fromDate(new Date(updates.endDate));
    }

    await updateDoc(planRef, updateData);

    const updatedPlan = await getDoc(planRef);
    const planData = updatedPlan.data()!;

    const mealPlan: MealPlan = {
      id: updatedPlan.id,
      user_id: planData.user_id,
      start_date: planData.start_date.toDate().toISOString().split('T')[0],
      end_date: planData.end_date.toDate().toISOString().split('T')[0],
      created_at: planData.created_at?.toDate().toISOString(),
      updated_at: planData.updated_at?.toDate().toISOString(),
    };

    return { data: mealPlan, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteMealPlan(planId: string, userId: string) {
  try {
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    if (planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    // Delete all meals in the subcollection
    const mealsRef = collection(db, 'mealPlans', planId, 'meals');
    const mealsSnap = await getDocs(mealsRef);
    const deletePromises = mealsSnap.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Delete the meal plan
    await deleteDoc(planRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Meals

export async function getMealsForPlan(planId: string, userId: string) {
  try {
    // First verify the user owns the meal plan
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    if (planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    // Get all meals for this plan
    const mealsRef = collection(db, 'mealPlans', planId, 'meals');
    const q = query(mealsRef, orderBy('date'), orderBy('meal_time'));
    const mealsSnap = await getDocs(q);

    const meals: Meal[] = mealsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        meal_plan_id: planId,
        date: data.date.toDate().toISOString().split('T')[0],
        meal_time: data.meal_time,
        title: data.title,
        recipe_id: data.recipe_id || null,
        description: data.description || null,
        servings: data.servings,
        created_at: data.created_at?.toDate().toISOString(),
      };
    });

    return { data: meals, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createMeal(
  planId: string,
  userId: string,
  mealData: {
    date: string;
    mealTime: string;
    title: string;
    recipeId?: string | null;
    description?: string | null;
    servings: number;
  }
) {
  try {
    // Verify the user owns the meal plan
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    if (planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealsRef = collection(db, 'mealPlans', planId, 'meals');
    const docRef = await addDoc(mealsRef, {
      date: Timestamp.fromDate(new Date(mealData.date)),
      meal_time: mealData.mealTime,
      title: mealData.title,
      recipe_id: mealData.recipeId || null,
      description: mealData.description || null,
      servings: mealData.servings,
      created_at: serverTimestamp(),
    });

    const newMeal = await getDoc(docRef);
    const data = newMeal.data()!;

    const meal: Meal = {
      id: docRef.id,
      meal_plan_id: planId,
      date: data.date.toDate().toISOString().split('T')[0],
      meal_time: data.meal_time,
      title: data.title,
      recipe_id: data.recipe_id || null,
      description: data.description || null,
      servings: data.servings,
      created_at: data.created_at?.toDate().toISOString(),
    };

    return { data: meal, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateMeal(
  planId: string,
  mealId: string,
  userId: string,
  updates: {
    date?: string;
    mealTime?: string;
    title?: string;
    recipeId?: string | null;
    description?: string | null;
    servings?: number;
  }
) {
  try {
    // Verify the user owns the meal plan
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    if (planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealRef = doc(db, 'mealPlans', planId, 'meals', mealId);
    const updateData: any = {};

    if (updates.date) {
      updateData.date = Timestamp.fromDate(new Date(updates.date));
    }
    if (updates.mealTime) updateData.meal_time = updates.mealTime;
    if (updates.title) updateData.title = updates.title;
    if (updates.recipeId !== undefined) updateData.recipe_id = updates.recipeId;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.servings) updateData.servings = updates.servings;

    await updateDoc(mealRef, updateData);

    const updatedMeal = await getDoc(mealRef);
    const data = updatedMeal.data()!;

    const meal: Meal = {
      id: updatedMeal.id,
      meal_plan_id: planId,
      date: data.date.toDate().toISOString().split('T')[0],
      meal_time: data.meal_time,
      title: data.title,
      recipe_id: data.recipe_id || null,
      description: data.description || null,
      servings: data.servings,
      created_at: data.created_at?.toDate().toISOString(),
    };

    return { data: meal, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteMeal(
  planId: string,
  mealId: string,
  userId: string
) {
  try {
    // Verify the user owns the meal plan
    const planRef = doc(db, 'mealPlans', planId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return { data: null, error: new Error('Meal plan not found') };
    }

    if (planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealRef = doc(db, 'mealPlans', planId, 'meals', mealId);
    await deleteDoc(mealRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
