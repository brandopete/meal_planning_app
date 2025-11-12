'use client';

import { use, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Sparkles, ChevronLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useMeals } from '@/lib/hooks/useMeals';
import { format, eachDayOfInterval, addDays } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { AddMealDialog } from '@/components/meals/AddMealDialog';
import type { MealPlan, Meal } from '@/types';

const MEAL_TIMES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function MealPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMealTime, setSelectedMealTime] = useState<string | null>(null);
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);

  const { data: mealPlan, isLoading: planLoading } = useQuery({
    queryKey: ['mealPlan', id],
    queryFn: async () => {
      const response = await fetch(`/api/mealplans/${id}`);
      if (!response.ok) throw new Error('Failed to fetch meal plan');
      return response.json() as Promise<MealPlan>;
    },
  });

  const { data: meals, isLoading: mealsLoading } = useMeals(id);

  const dates = mealPlan
    ? eachDayOfInterval({
        start: new Date(mealPlan.start_date),
        end: new Date(mealPlan.end_date),
      })
    : [];

  const getMealsForDateAndTime = (date: Date, mealTime: string) => {
    if (!meals) return [];
    const dateStr = format(date, 'yyyy-MM-dd');
    return meals.filter(
      (meal) => meal.date === dateStr && meal.meal_time === mealTime
    );
  };

  if (planLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <Skeleton className="h-10 w-1/3 mb-8" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!mealPlan) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-2">Meal plan not found</h2>
              <Button asChild className="mt-4">
                <Link href="/meal-plans">Back to Meal Plans</Link>
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/meal-plans">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Plans
                </Link>
              </Button>
              <h1 className="text-3xl font-bold mb-2">
                {format(new Date(mealPlan.start_date), 'MMM d')} -{' '}
                {format(new Date(mealPlan.end_date), 'MMM d, yyyy')}
              </h1>
              <p className="text-muted-foreground">
                {dates.length} day meal plan
              </p>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Grocery List
            </Button>
          </div>

          {/* Weekly Calendar Grid */}
          <div className="space-y-6">
            {dates.map((date) => (
              <Card key={date.toISOString()}>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                      {format(date, 'EEEE, MMMM d')}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MEAL_TIMES.map((mealTime) => {
                      const mealsForSlot = getMealsForDateAndTime(date, mealTime);
                      return (
                        <div
                          key={mealTime}
                          className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className="capitalize">
                              {mealTime}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => {
                                setSelectedDate(format(date, 'yyyy-MM-dd'));
                                setSelectedMealTime(mealTime);
                                setAddMealDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {mealsForSlot.length > 0 ? (
                              mealsForSlot.map((meal) => (
                                <div
                                  key={meal.id}
                                  className="text-sm p-2 bg-secondary rounded"
                                >
                                  <div className="font-medium">{meal.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {meal.servings} servings
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-sm text-muted-foreground italic">
                                No meal planned
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Meal Dialog */}
          {selectedDate && selectedMealTime && (
            <AddMealDialog
              open={addMealDialogOpen}
              onOpenChange={setAddMealDialogOpen}
              mealPlanId={id}
              date={selectedDate}
              mealTime={selectedMealTime}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
