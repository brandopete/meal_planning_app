// Meal Planning Types
export type MealTime = "breakfast" | "lunch" | "dinner" | "snack" | "custom";

export type UnitSystem = "imperial" | "metric";

export interface MealPlan {
  id: string;
  userId?: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
}

export interface Meal {
  id: string;
  mealPlanId: string;
  date: string; // ISO date string
  mealTime: MealTime;
  title: string;
  recipeId?: string | null;
  description?: string | null;
  servings: number;
  createdAt?: string;
}

// Recipe Types
export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  preparation?: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: RecipeIngredient[];
  instructions?: string;
  url?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Pantry Types
export interface PantryItem {
  id: string;
  userId?: string;
  item: string;
  quantity: number;
  unit: string;
  createdAt?: string;
  updatedAt?: string;
}

// Grocery List Types
export interface GroceryListMeta {
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  servingsScale: number;
  unitSystem: UnitSystem;
}

export interface GroceryItemSource {
  recipeId: string;
  mealDate: string;
  servings: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  displayName: string;
  quantity: number;
  unit: string;
  quantityInGrams?: number;
  category: string;
  notes?: string;
  fromRecipes: GroceryItemSource[];
  estimatedPrice?: number;
  storeSuggestions?: string[];
  optional: boolean;
}

export interface GroceryListSummary {
  totalItems: number;
  estimatedTotal?: number;
}

export interface GroceryList {
  id: string;
  mealPlanId: string;
  meta: GroceryListMeta;
  items: GroceryItem[];
  summary: GroceryListSummary;
  createdAt?: string;
}

// Budget Types
export interface BudgetEstimate {
  grocery_list_id: string;
  items: Array<{
    item_id: string;
    name: string;
    quantity: number;
    unit: string;
    estimated_price: number;
    store?: string;
  }>;
  category_subtotals: Record<string, number>;
  tax_estimate?: number;
  grand_total: number;
  created_at?: string;
}

// API Request/Response Types
export interface GenerateGroceryListRequest {
  mealPlanId: string;
  unitSystem: UnitSystem;
  pantryItems?: PantryItem[];
}

export interface GenerateGroceryListResponse {
  success: boolean;
  groceryList?: GroceryList;
  error?: string;
}

export interface PriceEstimateRequest {
  groceryListId: string;
  store?: string;
  manualOverrides?: Record<string, number>; // item_id -> price
}

export interface PriceEstimateResponse {
  success: boolean;
  budget?: BudgetEstimate;
  error?: string;
}
