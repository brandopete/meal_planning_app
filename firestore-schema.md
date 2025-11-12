# Firestore Database Schema

## Collections Structure

### users
Top-level collection for user profiles.

```
/users/{userId}
```

**Fields:**
- `email`: string
- `displayName`: string (optional)
- `createdAt`: timestamp
- `updatedAt`: timestamp

---

### mealPlans
Top-level collection for meal plans.

```
/mealPlans/{planId}
```

**Fields:**
- `userId`: string (reference to users/{userId})
- `startDate`: timestamp
- `endDate`: timestamp
- `createdAt`: timestamp
- `updatedAt`: timestamp

**Subcollection: meals**
```
/mealPlans/{planId}/meals/{mealId}
```

**Meal Fields:**
- `date`: timestamp
- `mealTime`: string (enum: 'breakfast', 'lunch', 'dinner', 'snack', 'custom')
- `title`: string
- `recipeId`: string (reference to recipes/{recipeId}, optional)
- `description`: string (optional)
- `servings`: number
- `createdAt`: timestamp

---

### recipes
Top-level collection for recipes (public/shared).

```
/recipes/{recipeId}
```

**Fields:**
- `title`: string
- `ingredients`: array of objects
  - `item`: string
  - `quantity`: number
  - `unit`: string
- `instructions`: string
- `url`: string (optional)
- `imageUrl`: string (optional, Firebase Storage URL)
- `createdAt`: timestamp
- `updatedAt`: timestamp

---

### pantryItems
Top-level collection for user pantry items.

```
/pantryItems/{itemId}
```

**Fields:**
- `userId`: string (reference to users/{userId})
- `item`: string
- `quantity`: number
- `unit`: string
- `createdAt`: timestamp
- `updatedAt`: timestamp

---

### groceryLists
Top-level collection for generated grocery lists.

```
/groceryLists/{listId}
```

**Fields:**
- `mealPlanId`: string (reference to mealPlans/{planId})
- `userId`: string (reference to users/{userId})
- `meta`: object (generation metadata)
  - `generatedAt`: timestamp
  - `model`: string
  - `promptVersion`: string
- `items`: array of objects
  - `item`: string
  - `quantity`: number
  - `unit`: string
  - `category`: string
  - `estimatedPrice`: number (optional)
- `summary`: object
  - `totalItems`: number
  - `estimatedTotal`: number (optional)
- `createdAt`: timestamp

---

## Key Differences from PostgreSQL Schema

1. **Meals as Subcollection**: Meals are now a subcollection under mealPlans instead of a separate table, which better represents the parent-child relationship and simplifies queries.

2. **No Foreign Key Constraints**: Firestore uses document references instead of foreign keys. The application code is responsible for maintaining referential integrity.

3. **Denormalization**: Some data may be duplicated (e.g., userId in both mealPlans and groceryLists) for query efficiency.

4. **Timestamp Type**: Using Firestore timestamp type instead of PostgreSQL's TIMESTAMP WITH TIME ZONE.

5. **Auto-IDs**: Firestore generates document IDs automatically (no need for uuid_generate_v4()).

6. **No Triggers**: Auto-updating timestamps must be handled in application code instead of database triggers.

## Indexing Strategy

Firestore automatically indexes all fields. Composite indexes will be created as needed based on query patterns:

- `mealPlans` where `userId` = X order by `startDate`
- `pantryItems` where `userId` = X order by `item`
- `meals` where `date` = X order by `mealTime`

These will be added to `firestore.indexes.json` as needed.
