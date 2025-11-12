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
    if (planData.userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealPlan: MealPlan = {
      id: planSnap.id,
      userId: planData.userId,
      startDate: planData.startDate.toDate().toISOString().split('T')[0],
      endDate: planData.endDate.toDate().toISOString().split('T')[0],
      createdAt: planData.createdAt?.toDate().toISOString(),
      updatedAt: planData.updatedAt?.toDate().toISOString(),
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
      userId,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newPlan = await getDoc(docRef);
    const planData = newPlan.data()!;

    const mealPlan: MealPlan = {
      id: docRef.id,
      userId: planData.userId,
      startDate: planData.startDate.toDate().toISOString().split('T')[0],
      endDate: planData.endDate.toDate().toISOString().split('T')[0],
      createdAt: planData.createdAt?.toDate().toISOString(),
      updatedAt: planData.updatedAt?.toDate().toISOString(),
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

    if (planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(new Date(updates.startDate));
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(new Date(updates.endDate));
    }

    await updateDoc(planRef, updateData);

    const updatedPlan = await getDoc(planRef);
    const planData = updatedPlan.data()!;

    const mealPlan: MealPlan = {
      id: updatedPlan.id,
      userId: planData.userId,
      startDate: planData.startDate.toDate().toISOString().split('T')[0],
      endDate: planData.endDate.toDate().toISOString().split('T')[0],
      createdAt: planData.createdAt?.toDate().toISOString(),
      updatedAt: planData.updatedAt?.toDate().toISOString(),
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

    if (planSnap.data().userId !== userId) {
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

    if (planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    // Get all meals for this plan
    const mealsRef = collection(db, 'mealPlans', planId, 'meals');
    const q = query(mealsRef, orderBy('date'), orderBy('mealTime'));
    const mealsSnap = await getDocs(q);

    const meals: Meal[] = mealsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        mealPlanId: planId,
        date: data.date.toDate().toISOString().split('T')[0],
        mealTime: data.mealTime,
        title: data.title,
        recipeId: data.recipeId || null,
        description: data.description || null,
        servings: data.servings,
        createdAt: data.createdAt?.toDate().toISOString(),
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

    if (planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealsRef = collection(db, 'mealPlans', planId, 'meals');
    const docRef = await addDoc(mealsRef, {
      date: Timestamp.fromDate(new Date(mealData.date)),
      mealTime: mealData.mealTime,
      title: mealData.title,
      recipeId: mealData.recipeId || null,
      description: mealData.description || null,
      servings: mealData.servings,
      createdAt: serverTimestamp(),
    });

    const newMeal = await getDoc(docRef);
    const data = newMeal.data()!;

    const meal: Meal = {
      id: docRef.id,
      mealPlanId: planId,
      date: data.date.toDate().toISOString().split('T')[0],
      mealTime: data.mealTime,
      title: data.title,
      recipeId: data.recipeId || null,
      description: data.description || null,
      servings: data.servings,
      createdAt: data.createdAt?.toDate().toISOString(),
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

    if (planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealRef = doc(db, 'mealPlans', planId, 'meals', mealId);
    const updateData: any = {};

    if (updates.date) {
      updateData.date = Timestamp.fromDate(new Date(updates.date));
    }
    if (updates.mealTime) updateData.mealTime = updates.mealTime;
    if (updates.title) updateData.title = updates.title;
    if (updates.recipeId !== undefined) updateData.recipeId = updates.recipeId;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.servings) updateData.servings = updates.servings;

    await updateDoc(mealRef, updateData);

    const updatedMeal = await getDoc(mealRef);
    const data = updatedMeal.data()!;

    const meal: Meal = {
      id: updatedMeal.id,
      mealPlanId: planId,
      date: data.date.toDate().toISOString().split('T')[0],
      mealTime: data.mealTime,
      title: data.title,
      recipeId: data.recipeId || null,
      description: data.description || null,
      servings: data.servings,
      createdAt: data.createdAt?.toDate().toISOString(),
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

    if (planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const mealRef = doc(db, 'mealPlans', planId, 'meals', mealId);
    await deleteDoc(mealRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
