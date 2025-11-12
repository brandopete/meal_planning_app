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
    const planRef = doc(db, 'mealPlans', data.mealPlanId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const groceryList: GroceryList = {
      id: listSnap.id,
      mealPlanId: data.mealPlanId,
      meta: data.meta,
      items: data.items as GroceryItem[],
      summary: data.summary,
      createdAt: data.createdAt?.toDate().toISOString(),
    };

    return { data: groceryList, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getGroceryListByMealPlan(
  mealPlanId: string,
  userId: string
) {
  try {
    // Verify ownership of meal plan
    const planRef = doc(db, 'mealPlans', mealPlanId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    // Get the most recent grocery list for this meal plan
    const listsRef = collection(db, 'groceryLists');
    const q = query(
      listsRef,
      where('mealPlanId', '==', mealPlanId),
      orderBy('createdAt', 'desc'),
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
      mealPlanId: data.mealPlanId,
      meta: data.meta,
      items: data.items as GroceryItem[],
      summary: data.summary,
      createdAt: data.createdAt?.toDate().toISOString(),
    };

    return { data: groceryList, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createGroceryList(
  mealPlanId: string,
  userId: string,
  listData: {
    meta: any;
    items: GroceryItem[];
    summary: any;
  }
) {
  try {
    // Verify ownership of meal plan
    const planRef = doc(db, 'mealPlans', mealPlanId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const listsRef = collection(db, 'groceryLists');
    const docRef = await addDoc(listsRef, {
      mealPlanId,
      userId, // Denormalize for easier querying
      meta: listData.meta,
      items: listData.items,
      summary: listData.summary,
      createdAt: serverTimestamp(),
    });

    const newList = await getDoc(docRef);
    const data = newList.data()!;

    const groceryList: GroceryList = {
      id: docRef.id,
      mealPlanId: data.mealPlanId,
      meta: data.meta,
      items: data.items as GroceryItem[],
      summary: data.summary,
      createdAt: data.createdAt?.toDate().toISOString(),
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
    const planRef = doc(db, 'mealPlans', data.mealPlanId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().userId !== userId) {
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
      mealPlanId: updatedData.mealPlanId,
      meta: updatedData.meta,
      items: updatedData.items as GroceryItem[],
      summary: updatedData.summary,
      createdAt: updatedData.createdAt?.toDate().toISOString(),
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
    const planRef = doc(db, 'mealPlans', data.mealPlanId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists() || planSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    await deleteDoc(listRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
