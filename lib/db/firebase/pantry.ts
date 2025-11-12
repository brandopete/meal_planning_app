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
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { PantryItem } from '@/types';

export async function getAllPantryItems(userId: string) {
  try {
    const pantryRef = collection(db, 'pantryItems');
    const q = query(
      pantryRef,
      where('user_id', '==', userId),
      orderBy('item')
    );
    const pantrySnap = await getDocs(q);

    const items: PantryItem[] = pantrySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        item: data.item,
        quantity: data.quantity,
        unit: data.unit,
        created_at: data.created_at?.toDate().toISOString(),
        updated_at: data.updated_at?.toDate().toISOString(),
      };
    });

    return { data: items, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getPantryItem(itemId: string, userId: string) {
  try {
    const itemRef = doc(db, 'pantryItems', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      return { data: null, error: new Error('Pantry item not found') };
    }

    const data = itemSnap.data();

    // Verify ownership
    if (data.user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const item: PantryItem = {
      id: itemSnap.id,
      user_id: data.user_id,
      item: data.item,
      quantity: data.quantity,
      unit: data.unit,
      created_at: data.created_at?.toDate().toISOString(),
      updated_at: data.updated_at?.toDate().toISOString(),
    };

    return { data: item, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createPantryItem(
  userId: string,
  itemData: {
    item: string;
    quantity: number;
    unit: string;
  }
) {
  try {
    const pantryRef = collection(db, 'pantryItems');
    const docRef = await addDoc(pantryRef, {
      user_id: userId,
      item: itemData.item,
      quantity: itemData.quantity,
      unit: itemData.unit,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    const newItem = await getDoc(docRef);
    const data = newItem.data()!;

    const pantryItem: PantryItem = {
      id: docRef.id,
      user_id: data.user_id,
      item: data.item,
      quantity: data.quantity,
      unit: data.unit,
      created_at: data.created_at?.toDate().toISOString(),
      updated_at: data.updated_at?.toDate().toISOString(),
    };

    return { data: pantryItem, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updatePantryItem(
  itemId: string,
  userId: string,
  updates: {
    item?: string;
    quantity?: number;
    unit?: string;
  }
) {
  try {
    const itemRef = doc(db, 'pantryItems', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      return { data: null, error: new Error('Pantry item not found') };
    }

    if (itemSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const updateData: any = {
      updated_at: serverTimestamp(),
    };

    if (updates.item) updateData.item = updates.item;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit) updateData.unit = updates.unit;

    await updateDoc(itemRef, updateData);

    const updatedItem = await getDoc(itemRef);
    const data = updatedItem.data()!;

    const pantryItem: PantryItem = {
      id: updatedItem.id,
      user_id: data.user_id,
      item: data.item,
      quantity: data.quantity,
      unit: data.unit,
      created_at: data.created_at?.toDate().toISOString(),
      updated_at: data.updated_at?.toDate().toISOString(),
    };

    return { data: pantryItem, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deletePantryItem(itemId: string, userId: string) {
  try {
    const itemRef = doc(db, 'pantryItems', itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {
      return { data: null, error: new Error('Pantry item not found') };
    }

    if (itemSnap.data().user_id !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    await deleteDoc(itemRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
