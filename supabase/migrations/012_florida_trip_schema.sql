-- Florida Trip Operations Hub - Schema
-- New tables for trip schedule, meals, grocery, tasks, signups, staff roster

-- Add logistics column to existing trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS logistics JSONB DEFAULT '{}';

-- 1. TRIP_SCHEDULE — Hour-by-hour daily timeline
CREATE TABLE IF NOT EXISTS trip_schedule (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('travel', 'match', 'meal', 'prep', 'free', 'recovery', 'other')),
  description TEXT,
  location TEXT,
  drive_info JSONB,
  sort_order INTEGER DEFAULT 0
);

-- 2. TRIP_MEALS — Meal plans with markdown recipes
CREATE TABLE IF NOT EXISTS trip_meals (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  name TEXT NOT NULL,
  description TEXT,
  recipe_content TEXT,
  prep_time_min INTEGER,
  cook_time_min INTEGER,
  nutrition JSONB,
  sort_order INTEGER DEFAULT 0
);

-- 3. TRIP_GROCERY_ITEMS — Individual grocery items with purchase tracking
CREATE TABLE IF NOT EXISTS trip_grocery_items (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT,
  estimated_price DECIMAL(6,2),
  category TEXT NOT NULL CHECK (category IN ('produce', 'meat', 'dairy', 'bakery', 'frozen', 'canned', 'dry_goods', 'condiments', 'spices', 'breakfast', 'snacks', 'beverages', 'household')),
  shopping_team TEXT CHECK (shopping_team IN ('alpha', 'bravo', 'charlie')),
  meal_use TEXT,
  is_purchased BOOLEAN DEFAULT FALSE,
  purchased_by INTEGER REFERENCES players(id),
  sort_order INTEGER DEFAULT 0
);

-- 4. TRIP_TASKS — Task/chore definitions
CREATE TABLE IF NOT EXISTS trip_tasks (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  time_slot TIME,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('cooking', 'dishes', 'cleanup', 'shopping', 'packing', 'driving', 'night_prep', 'other')),
  slots_needed INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

-- 5. TRIP_TASK_SIGNUPS — Player volunteering for tasks
CREATE TABLE IF NOT EXISTS trip_task_signups (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES trip_tasks(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  signed_up_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(task_id, player_id)
);

-- 6. TRIP_STAFF_ROSTER — Coaches/staff on the trip
CREATE TABLE IF NOT EXISTS trip_staff_roster (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  staff_id INTEGER REFERENCES staff(id),
  name TEXT NOT NULL,
  role_on_trip TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trip_schedule_trip_date ON trip_schedule(trip_id, day_date);
CREATE INDEX IF NOT EXISTS idx_trip_meals_trip_date ON trip_meals(trip_id, day_date);
CREATE INDEX IF NOT EXISTS idx_trip_tasks_trip_date ON trip_tasks(trip_id, day_date);
CREATE INDEX IF NOT EXISTS idx_trip_task_signups_task ON trip_task_signups(task_id);
CREATE INDEX IF NOT EXISTS idx_trip_task_signups_player ON trip_task_signups(player_id);
CREATE INDEX IF NOT EXISTS idx_trip_grocery_items_category ON trip_grocery_items(trip_id, category);

-- Enable RLS
ALTER TABLE trip_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_task_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_staff_roster ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated read for all tables
CREATE POLICY "Authenticated users can view trip_schedule" ON trip_schedule
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view trip_meals" ON trip_meals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view trip_grocery_items" ON trip_grocery_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view trip_tasks" ON trip_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view trip_task_signups" ON trip_task_signups
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view trip_staff_roster" ON trip_staff_roster
  FOR SELECT TO authenticated USING (true);

-- RLS: Coach/admin write for management tables
CREATE POLICY "Coaches can manage trip_schedule" ON trip_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

CREATE POLICY "Coaches can manage trip_meals" ON trip_meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

CREATE POLICY "Coaches can manage trip_tasks" ON trip_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

CREATE POLICY "Coaches can manage trip_staff_roster" ON trip_staff_roster
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

CREATE POLICY "Coaches can manage trip_grocery_items" ON trip_grocery_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- RLS: Players can manage their own task signups
CREATE POLICY "Players can signup for tasks" ON trip_task_signups
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = trip_task_signups.player_id
    )
  );

CREATE POLICY "Players can withdraw from tasks" ON trip_task_signups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = trip_task_signups.player_id
    )
  );

CREATE POLICY "Players can mark their own tasks done" ON trip_task_signups
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.player_id = trip_task_signups.player_id
    )
  );

-- RLS: Players can toggle grocery purchased status
CREATE POLICY "Players can update grocery purchase status" ON trip_grocery_items
  FOR UPDATE TO authenticated USING (true)
  WITH CHECK (true);
