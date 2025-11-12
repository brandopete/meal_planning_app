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
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { GroceryList, GroceryItem } from '@/types';

export async function getGroceryList(listId: string, userId: string) {
  try {
    const listRef = doc(db, 'groceryLists', listId);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
      return { data: null, error: new Error('Grocery list not found') };
    }

    const data = listSnap.data();

    // Verify ownership through meal plan
    const planRef = doc(db, 'mealPlans', data.meal_plan_id);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const groceryList: GroceryList = {
      id: listSnap.id,
      meal_plan_id: data.meal_plan_id,
      meta: data.meta,
      items: data.items as GroceryItem[],
      summary: data.summary,
      created_at: data.created_at?.toDate().toISOString(),
    };

    return { data: groceryList, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getGroceryListByMealPlan(
  meal_plan_id: string,
  userId: string
) {
  try {
    // Verify ownership of meal plan
    const planRef = doc(db, 'mealPlans', meal_plan_id);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    // Get the most recent grocery list for this meal plan
    const listsRef = collection(db, 'groceryLists');
    const q = query(
      listsRef,
      where('meal_plan_id', '==', meal_plan_id),
      orderBy('created_at', 'desc'),
      limit(1)
    );
    const listsSnap = await getDocs(q);

    if (listsSnap.empty) {
      return { data: null, error: null };
    }

    const listDoc = listsSnap.docs[0];
    const data = listDoc.data();

    const groceryList: GroceryList = {
      id: listDoc.id,
      meal_plan_id: data.meal_plan_id,
      meta: data.meta,
      items: data.items as GroceryItem[],
      summary: data.summary,
      created_at: data.created_at?.toDate().toISOString(),
    };

    return { data: groceryList, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createGroceryList(
  meal_plan_id: string,
  userId: string,
  listData: {
    meta: any;
    items: GroceryItem[];
    summary: any;
  }
) {
  try {
    // Verify ownership of meal plan
    const planRef = doc(db, 'mealPlans', meal_plan_id);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const listsRef = collection(db, 'groceryLists');
    const docRef = await addDoc(listsRef, {
      meal_plan_id,
      user_id: userId, // Denormalize for easier querying
      meta: listData.meta,
      items: listData.items,
      summary: listData.summary,
      created_at: serverTimestamp(),
    });

    const newList = await getDoc(docRef);
    const data = newList.data()!;

    const groceryList: GroceryList = {
      id: docRef.id,
      meal_plan_id: data.meal_plan_id,
      meta: data.meta,
      items: data.items as GroceryItem[],
      summary: data.summary,
      created_at: data.created_at?.toDate().toISOString(),
    };

    return { data: groceryList, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateGroceryList(
  listId: string,
  userId: string,
  updates: {
    items?: GroceryItem[];
    summary?: any;
  }
) {
  try {
    const listRef = doc(db, 'groceryLists', listId);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
      return { data: null, error: new Error('Grocery list not found') };
    }

    const data = listSnap.data();

    // Verify ownership through meal plan
    const planRef = doc(db, 'mealPlans', data.meal_plan_id);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const updateData: any = {};

    if (updates.items) updateData.items = updates.items;
    if (updates.summary) updateData.summary = updates.summary;

    await updateDoc(listRef, updateData);

    const updatedList = await getDoc(listRef);
    const updatedData = updatedList.data()!;

    const groceryList: GroceryList = {
      id: updatedList.id,
      meal_plan_id: updatedData.meal_plan_id,
      meta: updatedData.meta,
      items: updatedData.items as GroceryItem[],
      summary: updatedData.summary,
      created_at: updatedData.created_at?.toDate().toISOString(),
    };

    return { data: groceryList, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteGroceryList(listId: string, userId: string) {
  try {
    const listRef = doc(db, 'groceryLists', listId);
    const listSnap = await getDoc(listRef);

    if (!listSnap.exists()) {
      return { data: null, error: new Error('Grocery list not found') };
    }

    const data = listSnap.data();

    // Verify ownership through meal plan
    const planRef = doc(db, 'mealPlans', data.meal_plan_id);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    await deleteDoc(listRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
