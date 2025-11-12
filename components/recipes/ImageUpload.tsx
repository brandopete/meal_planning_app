'use client';

import { useState, useRef } from 'react';
import { uploadRecipeImage } from '@/lib/firebase/storage';
import Image from 'next/image';

interface ImageUploadProps {
  recipeId?: string;
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
  onError?: (error: string) => void;
}

export function ImageUpload({
  recipeId,
  currentImageUrl,
  onImageUploaded,
  onError,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError?.('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    if (recipeId) {
      setUploading(true);
      try {
        const { url, error } = await uploadRecipeImage(recipeId, file);
        if (error) {
          onError?.(error.message);
          setPreview(currentImageUrl || null);
        } else if (url) {
          onImageUploaded(url);
        }
      } catch (err: any) {
        onError?.(err.message || 'Failed to upload image');
        setPreview(currentImageUrl || null);
      } finally {
        setUploading(false);
      }
    } else {
      // Recipe not created yet, will upload after creation
      onError?.('Please save the recipe first before uploading an image');
      setPreview(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center gap-4">
        {preview && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={preview}
              alt="Recipe preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : preview ? 'Change Image' : 'Upload Image'}
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Supported formats: JPEG, PNG, GIF. Max size: 5MB
      </p>
    </div>
  );
}
