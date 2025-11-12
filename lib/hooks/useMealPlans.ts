import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/contexts/AuthContext";
import type { MealPlan } from "@/types";

export function useMealPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mealPlans", user?.uid],
    queryFn: async () => {
      const response = await fetch("/api/mealplans");
      if (!response.ok) {
        throw new Error("Failed to fetch meal plans");
      }
      return response.json() as Promise<MealPlan[]>;
    },
    enabled: !!user,
  });
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: { start_date: string; end_date: string }) => {
      const response = await fetch("/api/mealplans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create meal plan");
      }
      return response.json() as Promise<MealPlan>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans", user?.uid] });
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/mealplans/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete meal plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mealPlans", user?.uid] });
    },
  });
}
