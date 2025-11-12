'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">Create Meal Plans</h2>
              <p className="text-gray-600">
                Build weekly meal plans with custom recipes and servings
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">Generate Grocery Lists</h2>
              <p className="text-gray-600">
                AI-powered grocery lists with normalized items and quantities
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-3">Budget Tracking</h2>
              <p className="text-gray-600">
                Estimate costs and track spending by category
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500">App is ready with Firebase Authentication!</p>
          </div>
        </main>

        <footer className="bg-gray-100 p-4 text-center text-gray-600">
          <p>Meal Planning App &copy; 2025</p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
