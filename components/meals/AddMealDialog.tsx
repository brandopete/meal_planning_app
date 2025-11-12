'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRecipes } from '@/lib/hooks/useRecipes';
import { useAddMeal } from '@/lib/hooks/useMeals';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlanId: string;
  date: string;
  mealTime: string;
}

export function AddMealDialog({
  open,
  onOpenChange,
  mealPlanId,
  date,
  mealTime,
}: AddMealDialogProps) {
  const [recipeId, setRecipeId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [servings, setServings] = useState('4');

  const { data: recipes, isLoading: recipesLoading } = useRecipes();
  const addMeal = useAddMeal(mealPlanId);

  const handleSubmit = async () => {
    const selectedRecipe = recipes?.find((r) => r.id === recipeId);
    const title = recipeId && selectedRecipe ? selectedRecipe.title : customTitle;

    if (!title) {
      toast.error('Please select a recipe or enter a custom meal name');
      return;
    }

    try {
      await addMeal.mutateAsync({
        date,
        meal_time: mealTime,
        title,
        recipe_id: recipeId || undefined,
        servings: parseInt(servings, 10),
      });
      toast.success('Meal added successfully!');
      onOpenChange(false);
      setRecipeId('');
      setCustomTitle('');
      setServings('4');
    } catch (error) {
      toast.error('Failed to add meal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
          <DialogDescription>
            Add a meal for {mealTime} on {new Date(date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipe">Select Recipe (optional)</Label>
            {recipesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recipes...
              </div>
            ) : (
              <Select value={recipeId} onValueChange={setRecipeId}>
                <SelectTrigger id="recipe">
                  <SelectValue placeholder="Choose a recipe" />
                </SelectTrigger>
                <SelectContent>
                  {recipes && recipes.length > 0 ? (
                    recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No recipes available
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {!recipeId && (
            <div className="grid gap-2">
              <Label htmlFor="custom-title">Or enter a custom meal name</Label>
              <Input
                id="custom-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Leftover Pizza"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addMeal.isPending}>
            {addMeal.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Meal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
