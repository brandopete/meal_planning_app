# Meal Planning App

A full-stack meal planning application built with Next.js, Supabase, and OpenAI. Plan your meals, generate AI-powered grocery lists, and manage your budget.

## Features

- Create and manage weekly meal plans
- Recipe management with ingredients and instructions
- Pantry tracking to avoid duplicate purchases
- **AI-Powered Grocery List Generation** using OpenAI GPT-4
- Budget estimation with category breakdowns
- Export grocery lists as JSON or CSV
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14+ (React), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4
- **Validation**: Zod
- **Utilities**: date-fns, papaparse, uuid

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd meal_planning_app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Optional: OpenAI Model Configuration
OPENAI_MODEL=gpt-4-turbo-preview
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
meal_planning_app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── mealplans/        # Meal plan endpoints
│   │   ├── recipes/          # Recipe endpoints
│   │   ├── pantry/           # Pantry endpoints
│   │   ├── price-estimates/  # Budget calculation
│   │   └── exports/          # Export endpoints
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/               # React components
├── lib/                      # Utilities and helpers
│   ├── ai/                   # OpenAI integration
│   ├── db/                   # Database helpers
│   └── utils/                # Utility functions
├── types/                    # TypeScript type definitions
├── public/                   # Static assets
└── supabase-schema.sql       # Database schema
```

## API Endpoints

### Meal Plans

- `POST /api/mealplans` - Create a meal plan
- `GET /api/mealplans/{id}` - Get a meal plan
- `PUT /api/mealplans/{id}` - Update a meal plan
- `DELETE /api/mealplans/{id}` - Delete a meal plan
- `GET /api/mealplans/{id}/meals` - Get meals for a plan
- `POST /api/mealplans/{id}/meals` - Add a meal to a plan
- `POST /api/mealplans/{id}/grocery-list` - Generate grocery list (AI-powered)

### Recipes

- `GET /api/recipes` - List all recipes
- `POST /api/recipes` - Create a recipe
- `GET /api/recipes/{id}` - Get a recipe
- `PUT /api/recipes/{id}` - Update a recipe
- `DELETE /api/recipes/{id}` - Delete a recipe

### Pantry

- `GET /api/pantry` - List pantry items
- `POST /api/pantry` - Add pantry item
- `GET /api/pantry/{id}` - Get pantry item
- `PUT /api/pantry/{id}` - Update pantry item
- `DELETE /api/pantry/{id}` - Delete pantry item

### Budget & Export

- `POST /api/price-estimates` - Calculate budget estimate
- `GET /api/exports/grocery-list/{id}?format=json|csv` - Export grocery list

## Usage Examples

### 1. Create a Meal Plan

```bash
curl -X POST http://localhost:3000/api/mealplans \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2025-11-10",
    "end_date": "2025-11-16"
  }'
```

### 2. Create a Recipe

```bash
curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spaghetti Carbonara",
    "ingredients": [
      {"name": "spaghetti", "amount": 400, "unit": "g"},
      {"name": "bacon", "amount": 200, "unit": "g"},
      {"name": "eggs", "amount": 4, "unit": "whole"},
      {"name": "parmesan", "amount": 100, "unit": "g"}
    ],
    "instructions": "1. Cook pasta...",
    "url": "https://example.com/recipe"
  }'
```

### 3. Add a Meal to Plan

```bash
curl -X POST http://localhost:3000/api/mealplans/{MEAL_PLAN_ID}/meals \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-12",
    "meal_time": "dinner",
    "title": "Spaghetti Carbonara",
    "recipe_id": "{RECIPE_ID}",
    "servings": 4
  }'
```

### 4. Generate Grocery List (AI-Powered)

```bash
curl -X POST http://localhost:3000/api/mealplans/{MEAL_PLAN_ID}/grocery-list \
  -H "Content-Type: application/json" \
  -d '{
    "unit_system": "imperial",
    "pantry_items": []
  }'
```

The AI will:
- Normalize ingredient names
- Consolidate duplicate items
- Convert units appropriately
- Categorize items
- Estimate prices
- Subtract pantry items

### 5. Calculate Budget

```bash
curl -X POST http://localhost:3000/api/price-estimates \
  -H "Content-Type: application/json" \
  -d '{
    "grocery_list_id": "{GROCERY_LIST_ID}",
    "manual_overrides": {
      "{ITEM_ID}": 5.99
    }
  }'
```

### 6. Export Grocery List

```bash
# JSON
curl http://localhost:3000/api/exports/grocery-list/{GROCERY_LIST_ID}?format=json

# CSV
curl http://localhost:3000/api/exports/grocery-list/{GROCERY_LIST_ID}?format=csv
```

## How the AI Grocery List Generation Works

The app uses OpenAI GPT-4 to intelligently process meal plans and generate structured grocery lists:

1. **Input**: Meal plan with recipes, servings, and pantry items
2. **AI Processing**:
   - Expands recipes and scales ingredients by servings
   - Normalizes ingredient names (e.g., "Roma tomatoes" → "tomatoes")
   - Converts units to canonical format (imperial or metric)
   - Merges duplicate items across recipes
   - Categorizes items (produce, dairy, meat, etc.)
   - Estimates prices using heuristics
   - Subtracts pantry items
3. **Output**: Structured JSON following the Grocery List Schema

See the prompt template in `lib/ai/generate-grocery-list.ts` for details.

## Development

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

## Database Schema

The database schema includes the following tables:

- **meal_plans**: Stores meal plan date ranges
- **meals**: Individual meals within plans
- **recipes**: Recipe details with ingredients (JSONB)
- **pantry_items**: User's pantry inventory
- **grocery_lists**: Generated grocery lists (JSONB)

All tables include Row Level Security (RLS) policies for multi-user support.

See `supabase-schema.sql` for the complete schema.

## Future Enhancements

- Calendar integration (Apple Calendar, Google Calendar) via iCal/ICS export
- Real-time price lookups via store APIs (Walmart, Instacart)
- Mobile app with voice input and shopping list check-off
- Meal plan templates and sharing
- Nutritional information tracking
- Multi-language support

## Troubleshooting

### OpenAI API Errors

- Ensure your `OPENAI_API_KEY` is valid
- Check your OpenAI account has sufficient credits
- Verify the model name in `.env.local` (default: `gpt-4-turbo-preview`)

### Supabase Connection Issues

- Verify your Supabase URL and anon key are correct
- Check that RLS policies are set up correctly
- Ensure the schema migration ran successfully

### Build Errors

- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

TBD

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the requirements document for specifications

---

Built with Next.js, Supabase, and OpenAI GPT-4
