import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Meal } from "@/types";

export function useMeals(mealPlanId: string) {
  return useQuery({
    queryKey: ["meals", mealPlanId],
    queryFn: async () => {
      const response = await fetch(`/api/mealplans/${mealPlanId}/meals`);
      if (!response.ok) {
        throw new Error("Failed to fetch meals");
      }
      return response.json() as Promise<Meal[]>;
    },
    enabled: !!mealPlanId,
  });
}

export function useAddMeal(mealPlanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      meal_time: string;
      title: string;
      recipe_id?: string;
      servings: number;
    }) => {
      const response = await fetch(`/api/mealplans/${mealPlanId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to add meal");
      }
      return response.json() as Promise<Meal>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", mealPlanId] });
    },
  });
}

export function useDeleteMeal(mealPlanId: string, mealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/mealplans/${mealPlanId}/meals/${mealId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete meal");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals", mealPlanId] });
    },
  });
}
