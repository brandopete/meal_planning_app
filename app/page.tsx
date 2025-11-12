'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Calendar, ChefHat, ShoppingBasket, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Plan your meals, manage recipes, and generate smart grocery lists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Meal Plans Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Calendar className="h-8 w-8 text-primary" />
                  <Button asChild size="sm">
                    <Link href="/meal-plans">
                      <Plus className="h-4 w-4 mr-1" />
                      New Plan
                    </Link>
                  </Button>
                </div>
                <CardTitle className="mt-4">Meal Plans</CardTitle>
                <CardDescription>
                  Create weekly meal plans and organize your meals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/meal-plans">View All Plans</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recipes Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <ChefHat className="h-8 w-8 text-primary" />
                  <Button asChild size="sm">
                    <Link href="/recipes/new">
                      <Plus className="h-4 w-4 mr-1" />
                      New Recipe
                    </Link>
                  </Button>
                </div>
                <CardTitle className="mt-4">Recipes</CardTitle>
                <CardDescription>
                  Browse and manage your recipe collection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/recipes">Browse Recipes</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pantry Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <ShoppingBasket className="h-8 w-8 text-primary" />
                  <Button asChild size="sm">
                    <Link href="/pantry">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Link>
                  </Button>
                </div>
                <CardTitle className="mt-4">Pantry</CardTitle>
                <CardDescription>
                  Track what you have to avoid duplicate purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/pantry">Manage Pantry</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI-Powered Grocery Lists</CardTitle>
              </div>
              <CardDescription>
                Generate smart grocery lists from your meal plans with automatic ingredient consolidation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>✓ Automatic ingredient normalization and merging</div>
                <div>✓ Unit conversion (metric/imperial)</div>
                <div>✓ Category organization</div>
                <div>✓ Price estimation and budget tracking</div>
                <div>✓ Pantry deduction</div>
                <div>✓ Export to JSON or CSV</div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
