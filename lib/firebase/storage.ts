import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/config';

export async function uploadRecipeImage(
  recipeId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `recipes/${recipeId}/${filename}`);

    // Upload file
    await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(storageRef);

    return { url, error: null };
  } catch (error) {
    console.error('Error uploading recipe image:', error);
    return { url: null, error: error as Error };
  }
}

export async function deleteRecipeImage(imageUrl: string): Promise<{ error: Error | null }> {
  try {
    // Extract the storage path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);

    return { error: null };
  } catch (error) {
    console.error('Error deleting recipe image:', error);
    return { error: error as Error };
  }
}

export async function uploadUserImage(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storageRef = ref(storage, `users/${userId}/${filename}`);

    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    return { url, error: null };
  } catch (error) {
    console.error('Error uploading user image:', error);
    return { url: null, error: error as Error };
  }
}
