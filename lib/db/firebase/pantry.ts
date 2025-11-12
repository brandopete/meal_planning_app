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
      where('userId', '==', userId),
      orderBy('item')
    );
    const pantrySnap = await getDocs(q);

    const items: PantryItem[] = pantrySnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        item: data.item,
        quantity: data.quantity,
        unit: data.unit,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
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
    if (data.userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const item: PantryItem = {
      id: itemSnap.id,
      userId: data.userId,
      item: data.item,
      quantity: data.quantity,
      unit: data.unit,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
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
      userId,
      item: itemData.item,
      quantity: itemData.quantity,
      unit: itemData.unit,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newItem = await getDoc(docRef);
    const data = newItem.data()!;

    const pantryItem: PantryItem = {
      id: docRef.id,
      userId: data.userId,
      item: data.item,
      quantity: data.quantity,
      unit: data.unit,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
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

    if (itemSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.item) updateData.item = updates.item;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit) updateData.unit = updates.unit;

    await updateDoc(itemRef, updateData);

    const updatedItem = await getDoc(itemRef);
    const data = updatedItem.data()!;

    const pantryItem: PantryItem = {
      id: updatedItem.id,
      userId: data.userId,
      item: data.item,
      quantity: data.quantity,
      unit: data.unit,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
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

    if (itemSnap.data().userId !== userId) {
      return { data: null, error: new Error('Unauthorized') };
    }

    await deleteDoc(itemRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
