import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Recipe, RecipeIngredient } from '@/types';

export async function getAllRecipes() {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(recipesRef, orderBy('title'));
    const recipesSnap = await getDocs(q);

    const recipes: Recipe[] = recipesSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        ingredients: data.ingredients as RecipeIngredient[],
        instructions: data.instructions,
        url: data.url || null,
        imageUrl: data.imageUrl || null,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      };
    });

    return { data: recipes, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function getRecipe(recipeId: string) {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
      return { data: null, error: new Error('Recipe not found') };
    }

    const data = recipeSnap.data();
    const recipe: Recipe = {
      id: recipeSnap.id,
      title: data.title,
      ingredients: data.ingredients as RecipeIngredient[],
      instructions: data.instructions,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };

    return { data: recipe, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function createRecipe(recipeData: {
  title: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  url?: string | null;
  imageUrl?: string | null;
}) {
  try {
    const recipesRef = collection(db, 'recipes');
    const docRef = await addDoc(recipesRef, {
      title: recipeData.title,
      ingredients: recipeData.ingredients,
      instructions: recipeData.instructions,
      url: recipeData.url || null,
      imageUrl: recipeData.imageUrl || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const newRecipe = await getDoc(docRef);
    const data = newRecipe.data()!;

    const recipe: Recipe = {
      id: docRef.id,
      title: data.title,
      ingredients: data.ingredients as RecipeIngredient[],
      instructions: data.instructions,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };

    return { data: recipe, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function updateRecipe(
  recipeId: string,
  updates: {
    title?: string;
    ingredients?: RecipeIngredient[];
    instructions?: string;
    url?: string | null;
    imageUrl?: string | null;
  }
) {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
      return { data: null, error: new Error('Recipe not found') };
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (updates.title) updateData.title = updates.title;
    if (updates.ingredients) updateData.ingredients = updates.ingredients;
    if (updates.instructions) updateData.instructions = updates.instructions;
    if (updates.url !== undefined) updateData.url = updates.url;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;

    await updateDoc(recipeRef, updateData);

    const updatedRecipe = await getDoc(recipeRef);
    const data = updatedRecipe.data()!;

    const recipe: Recipe = {
      id: updatedRecipe.id,
      title: data.title,
      ingredients: data.ingredients as RecipeIngredient[],
      instructions: data.instructions,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };

    return { data: recipe, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

export async function deleteRecipe(recipeId: string) {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
      return { data: null, error: new Error('Recipe not found') };
    }

    await deleteDoc(recipeRef);

    return { data: { success: true }, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
