export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">Meal Planning App</h1>
        <p className="text-blue-100 mt-2">Plan meals, generate grocery lists, and manage your budget</p>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Create Meal Plans</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Build weekly meal plans with custom recipes and servings
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Generate Grocery Lists</h2>
            <p className="text-gray-600 dark:text-gray-300">
              AI-powered grocery lists with normalized items and quantities
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Budget Tracking</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Estimate costs and track spending by category
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">App is currently in development</p>
        </div>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 p-4 text-center text-gray-600 dark:text-gray-400">
        <p>Meal Planning App &copy; 2025</p>
      </footer>
    </div>
  );
}
