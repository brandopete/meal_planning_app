// Meal Planning Types
export type MealTime = "breakfast" | "lunch" | "dinner" | "snack" | "custom";

export type UnitSystem = "imperial" | "metric";

export interface MealPlan {
  id: string;
  user_id?: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  meal_plan_id: string;
  date: string; // ISO date string
  meal_time: MealTime;
  title: string;
  recipe_id?: string;
  description?: string;
  servings: number;
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
  url?: string;
  created_at?: string;
  updated_at?: string;
}

// Pantry Types
export interface PantryItem {
  id: string;
  user_id?: string;
  item: string;
  quantity: number;
  unit: string;
  created_at?: string;
  updated_at?: string;
}

// Grocery List Types
export interface GroceryListMeta {
  generated_at: string;
  date_range: {
    start: string;
    end: string;
  };
  servings_scale: number;
  unit_system: UnitSystem;
}

export interface GroceryItemSource {
  recipe_id: string;
  meal_date: string;
  servings: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  display_name: string;
  quantity: number;
  unit: string;
  quantity_in_grams?: number;
  category: string;
  notes?: string;
  from_recipes: GroceryItemSource[];
  estimated_price?: number;
  store_suggestions?: string[];
  optional: boolean;
}

export interface GroceryListSummary {
  total_items: number;
  estimated_total?: number;
}

export interface GroceryList {
  id: string;
  meal_plan_id: string;
  meta: GroceryListMeta;
  items: GroceryItem[];
  summary: GroceryListSummary;
  created_at?: string;
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
  meal_plan_id: string;
  unit_system: UnitSystem;
  pantry_items?: PantryItem[];
}

export interface GenerateGroceryListResponse {
  success: boolean;
  grocery_list?: GroceryList;
  error?: string;
}

export interface PriceEstimateRequest {
  grocery_list_id: string;
  store?: string;
  manual_overrides?: Record<string, number>; // item_id -> price
}

export interface PriceEstimateResponse {
  success: boolean;
  budget?: BudgetEstimate;
  error?: string;
}
