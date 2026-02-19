-- Florida Trip Operations Hub - Seed Data
-- Trip: Spring Break Florida Trip, Feb 28 - Mar 6, 2026
-- Destination: Storey Lake Resort, Kissimmee, FL
-- All inserts reference the trip via subquery

-- ============================================================================
-- 1. UPDATE TRIPS LOGISTICS
-- ============================================================================

UPDATE trips
SET logistics = '{
  "condo": {
    "address": "2713 Bookmark Dr, Kissimmee FL 34746",
    "resort": "Storey Lake Resort",
    "check_in": "4:00 PM Saturday",
    "check_out": "10:00 AM Friday",
    "bedrooms": 4,
    "notes": "4BR/3BA townhouse with full kitchen, pool access"
  },
  "kitchen_equipment": [
    "2 large pots", "2 large pans", "baking sheets", "cutting boards",
    "sharp knives", "mixing bowls", "colander", "can opener",
    "measuring cups", "spatulas", "tongs"
  ],
  "fridge_zones": {
    "top_shelf": "Drinks & ready-to-eat",
    "middle_shelf": "Dairy, eggs, leftovers",
    "bottom_shelf": "Raw meat (sealed)",
    "door": "Condiments & sauces",
    "freezer": "Frozen chicken, ice"
  },
  "food_safety": [
    "Wash hands before cooking",
    "Raw meat on bottom shelf only",
    "Leftovers refrigerated within 2 hours",
    "Chicken internal temp 165°F",
    "Reheat leftovers to 165°F"
  ],
  "nutrition_targets": {
    "kcal": 3200,
    "carbs_g": 450,
    "protein_g": 140,
    "fat_g": 90,
    "hydration_oz": 100
  },
  "travel": {
    "van_count": 2,
    "driving_distances": {
      "Rose-Hulman to Nashville": "4h 15min",
      "Nashville to Kissimmee": "9h 30min",
      "Condo to Orange County National": "20min",
      "Condo to Walmart": "8min"
    }
  }
}'::jsonb
WHERE name = 'Spring Break Florida Trip';


-- ============================================================================
-- 2. TRIP_SCHEDULE (~55 rows)
-- ============================================================================

-- ---------- Feb 28 (Sat) - Travel Day ----------
INSERT INTO trip_schedule (trip_id, day_date, start_time, end_time, title, category, description, location, drive_info, sort_order) VALUES
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '06:00', '06:30', 'Load vans', 'travel', 'Load luggage, coolers, tennis gear into both vans. Check roster against van assignments.', 'Hulbert Tennis Center', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '06:30', '10:30', 'Drive: Terre Haute → Nashville', 'travel', 'Leg 1 of southbound drive. Rotate drivers every 2 hours. Stay together on the road.', 'I-70 W to I-65 S', '{"destination": "Nashville, TN", "distance_mi": 260, "drive_time_min": 255, "route_notes": "I-70 W to I-65 S"}', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '10:30', '11:15', 'Lunch stop — Nashville', 'meal', 'Quick stop for food and gas. Fast food or packed sandwiches. 45 min max.', 'Nashville area', NULL, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '11:15', '20:30', 'Drive: Nashville → Kissimmee', 'travel', 'Leg 2. Long haul through Tennessee, Georgia, and Florida. Expect I-4 congestion near Orlando. Gas stops every 3 hours.', 'I-24 to I-75 to I-4', '{"destination": "Kissimmee, FL", "distance_mi": 620, "drive_time_min": 555, "route_notes": "I-24 to I-75 to I-4", "i4_risk": "Heavy traffic near Orlando — expect delays"}', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '20:30', '21:00', 'Arrive & unload', 'other', 'Unload vans, pick bedrooms, settle in. Coaches claim rooms first.', '2713 Bookmark Dr, Kissimmee FL 34746', NULL, 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '21:00', '21:30', 'Walmart grocery run', 'prep', 'Split into 3 shopping teams (Alpha, Bravo, Charlie). See grocery list. Meet at checkout in 25 min.', 'Walmart Supercenter', NULL, 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '21:30', '22:30', 'Organize kitchen & fridge', 'prep', 'Unpack groceries by fridge zone. Top shelf: drinks & ready-to-eat. Middle: dairy, eggs. Bottom: raw meat (sealed). Door: condiments. Freezer: frozen chicken, ice.', 'Condo kitchen', NULL, 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '22:30', '23:00', 'Light dinner — sandwiches', 'meal', 'No cooking tonight. Make sandwiches from bread, deli supplies, PB&J. Clean up after.', 'Condo', NULL, 80),

-- ---------- Mar 1 (Sun) - Day 2: First Full Day ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '07:00', '07:30', 'Breakfast', 'meal', 'Oatmeal, fruit, toast, PB&J. Quick and easy — match day fuel.', 'Condo', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '07:30', '08:00', 'Pack match bags', 'prep', 'Rackets, water bottles, towels, snacks, extra grip tape. Sunscreen on before leaving.', 'Condo', NULL, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '08:00', '08:20', 'Drive to courts', 'travel', 'Both vans to Orange County National. Parking near courts 1-8.', 'En route', '{"destination": "Orange County National", "distance_mi": 12, "drive_time_min": 20}', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '08:30', '11:30', 'Morning practice', 'match', 'Full team practice. Warm-up, drills, point play. Coach Wilson runs session.', 'Orange County National', NULL, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '11:30', '12:30', 'Lunch', 'meal', 'Back to condo for sandwiches and wraps. Hydrate well before afternoon session.', 'Condo', NULL, 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '13:00', '15:00', 'Afternoon match/practice', 'match', 'Match play sets or challenge matches. Focus on doubles combinations.', 'Orange County National', NULL, 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '15:30', '17:00', 'Free time / recovery', 'free', 'Pool, stretch, foam roll, nap. Stay hydrated. No leaving the resort without telling a coach.', 'Condo', NULL, 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '17:00', '18:30', 'Dinner prep & cook', 'meal', 'Cooking team starts Big Baked Pasta. See recipe in Meals tab. Others set table and help chop.', 'Condo kitchen', NULL, 80),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '18:30', '19:30', 'Dinner — Big Baked Pasta', 'meal', 'Serve family-style. Everyone eats together. Seconds available.', 'Condo', NULL, 90),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '19:30', '20:30', 'Dish crew & kitchen cleanup', 'other', 'Dish crew washes everything. Kitchen wipe crew handles counters and stove. Trash out if full.', 'Condo kitchen', NULL, 100),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '20:30', '22:00', 'Free time', 'free', 'Relax, games, TV. Stay in resort area.', 'Condo', NULL, 110),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '22:00', '22:30', 'Night-before prep', 'prep', 'Thaw chicken thighs for Monday dinner. Prep rice if possible. Set out breakfast supplies.', 'Condo kitchen', NULL, 120),

-- ---------- Mar 2 (Mon) - Day 3 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '07:00', '07:30', 'Breakfast', 'meal', 'Oatmeal, fruit, toast with PB. Coffee for coaches.', 'Condo', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '07:30', '08:00', 'Pack match bags', 'prep', 'Rackets, water, snacks. Apply sunscreen.', 'Condo', NULL, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '08:00', '08:20', 'Drive to courts', 'travel', 'Both vans to courts.', 'En route', '{"destination": "Orange County National", "distance_mi": 12, "drive_time_min": 20}', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '09:00', '12:00', 'Morning match', 'match', 'Match play. Coach Wilson sets lineups the night before.', 'Orange County National', NULL, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '12:00', '13:00', 'Lunch', 'meal', 'Back to condo. Sandwiches and wraps.', 'Condo', NULL, 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '13:30', '16:00', 'Afternoon match/practice', 'match', 'Second session — doubles focus or challenge matches.', 'Orange County National', NULL, 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '16:30', '17:30', 'Free time / recovery', 'free', 'Pool, rest, stretch. Hydrate.', 'Condo', NULL, 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '17:30', '18:30', 'Dinner prep & cook', 'meal', 'Cooking team starts Chicken Stir-Fry Rice Bowls. See recipe in Meals tab.', 'Condo kitchen', NULL, 80),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '18:30', '19:30', 'Dinner — Chicken Stir-Fry Rice Bowls', 'meal', 'Serve bowl-style. Rice, chicken, veggies, soy sauce.', 'Condo', NULL, 90),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '19:30', '20:30', 'Dish crew & kitchen cleanup', 'other', 'Full dish and wipe routine.', 'Condo kitchen', NULL, 100),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '20:30', '22:00', 'Free time', 'free', 'Relax. Lights-out suggestion at 22:30.', 'Condo', NULL, 110),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '22:00', '22:30', 'Night-before prep', 'prep', 'Thaw ground beef for Taco Tuesday. Set out taco shells, seasoning packets.', 'Condo kitchen', NULL, 120),

-- ---------- Mar 3 (Tue) - Day 4 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '07:00', '07:30', 'Breakfast', 'meal', 'Oatmeal, bananas, toast, PB&J.', 'Condo', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '07:30', '08:00', 'Pack match bags', 'prep', 'Standard match-day packing routine.', 'Condo', NULL, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '08:00', '08:20', 'Drive to courts', 'travel', 'Both vans.', 'En route', '{"destination": "Orange County National", "distance_mi": 12, "drive_time_min": 20}', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '09:00', '12:00', 'Morning match', 'match', 'Match day. Lineups posted morning of.', 'Orange County National', NULL, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '12:00', '13:00', 'Lunch', 'meal', 'Condo lunch. Sandwiches, fruit, Gatorade.', 'Condo', NULL, 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '13:30', '16:00', 'Afternoon match/practice', 'match', 'Afternoon session. Singles and doubles.', 'Orange County National', NULL, 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '16:30', '17:30', 'Free time / recovery', 'free', 'Rest and recover.', 'Condo', NULL, 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '17:30', '18:30', 'Dinner prep & cook', 'meal', 'Cooking team: Taco Bar night. Brown beef, set up toppings station.', 'Condo kitchen', NULL, 80),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '18:30', '19:30', 'Dinner — Taco Bar', 'meal', 'Build-your-own tacos and burritos. Hard shells, soft tortillas, all toppings out.', 'Condo', NULL, 90),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '19:30', '20:30', 'Dish crew & kitchen cleanup', 'other', 'Full dish and wipe routine.', 'Condo kitchen', NULL, 100),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '20:30', '22:00', 'Free time', 'free', 'Relax. Last night before coach change.', 'Condo', NULL, 110),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '22:00', '22:30', 'Night-before prep', 'prep', 'Thaw chicken breast for Wednesday Alfredo. Prep garlic bread.', 'Condo kitchen', NULL, 120),

-- ---------- Mar 4 (Wed) - Day 5: Coach Transition ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '07:00', '07:30', 'Breakfast', 'meal', 'Oatmeal, fruit, toast.', 'Condo', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '07:30', '08:00', 'Pack match bags', 'prep', 'Standard routine. Amanda packs and departs after morning session.', 'Condo', NULL, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '08:00', '08:20', 'Drive to courts', 'travel', 'Both vans.', 'En route', '{"destination": "Orange County National", "distance_mi": 12, "drive_time_min": 20}', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '09:00', '12:00', 'Morning match', 'match', 'Match play. Amanda''s last session.', 'Orange County National', NULL, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '12:00', '13:00', 'Lunch & Amanda departure', 'meal', 'Lunch at condo. Amanda departs afterward. Coach Kacey arrives mid-afternoon.', 'Condo', NULL, 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '13:30', '16:00', 'Afternoon match/practice', 'match', 'Afternoon session. Coach Kacey joins if arrived.', 'Orange County National', NULL, 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '16:30', '17:30', 'Free time / recovery', 'free', 'Rest. Welcome Coach Kacey.', 'Condo', NULL, 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '17:30', '18:30', 'Dinner prep & cook', 'meal', 'Cooking team: Chicken Alfredo Pasta. See recipe in Meals tab.', 'Condo kitchen', NULL, 80),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '18:30', '19:30', 'Dinner — Chicken Alfredo Pasta', 'meal', 'Grilled chicken over fettuccine with alfredo sauce and garlic bread.', 'Condo', NULL, 90),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '19:30', '20:30', 'Dish crew & kitchen cleanup', 'other', 'Full dish and wipe routine.', 'Condo kitchen', NULL, 100),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '20:30', '22:00', 'Free time', 'free', 'Relax. Tomorrow is last match day.', 'Condo', NULL, 110),

-- ---------- Mar 5 (Thu) - Day 6: Last Full Day ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '07:00', '07:30', 'Breakfast', 'meal', 'Oatmeal, fruit, last of the bread and PB.', 'Condo', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '07:30', '08:00', 'Pack match bags', 'prep', 'Last match day. Bring everything — nothing stays at courts.', 'Condo', NULL, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '08:00', '08:20', 'Drive to courts', 'travel', 'Both vans.', 'En route', '{"destination": "Orange County National", "distance_mi": 12, "drive_time_min": 20}', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '09:00', '12:00', 'Morning match — final session', 'match', 'Last match of the trip. Leave it all on the court.', 'Orange County National', NULL, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '12:00', '13:00', 'Lunch', 'meal', 'Last lunch at condo. Use remaining sandwich supplies.', 'Condo', NULL, 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '13:30', '16:00', 'Free time — afternoon off', 'free', 'Pool, relax, explore resort. Last free afternoon.', 'Condo / Storey Lake Resort', NULL, 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '16:00', '17:00', 'Pack personal bags', 'prep', 'Pack everything. Luggage by the door tonight. Check under beds and in bathrooms.', 'Condo', NULL, 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '17:00', '18:00', 'Dinner — use remaining food', 'meal', 'Use up leftovers and remaining groceries. Pasta, rice, whatever is left.', 'Condo kitchen', NULL, 80),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '18:00', '19:00', 'Dish crew & deep kitchen clean', 'other', 'Wash everything. Wipe fridge inside. Clean oven and stove. Leave kitchen spotless.', 'Condo kitchen', NULL, 90),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '19:00', '20:00', 'Departure packing & van loading', 'prep', 'Load luggage and gear into vans tonight so morning departure is fast.', 'Condo / Vans', NULL, 100),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '20:00', '22:00', 'Free time — last night', 'free', 'Early lights-out recommended. Long drive tomorrow.', 'Condo', NULL, 110),

-- ---------- Mar 6 (Fri) - Travel Home ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '06:00', '06:30', 'Final cleanup & checkout prep', 'other', 'Walk-through all rooms. Check drawers, closets, bathrooms. Strip beds. Take out all trash. Verify nothing left behind.', 'Condo', NULL, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '06:30', '07:00', 'Breakfast — grab and go', 'meal', 'Granola bars, fruit, whatever is left. Eat in the van if needed.', 'Condo', NULL, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '07:00', '16:30', 'Drive: Kissimmee → Nashville', 'travel', 'Northbound leg 1. Reverse the route. Gas stops every 3 hours. Rotate drivers.', 'I-4 to I-75 to I-24', '{"destination": "Nashville, TN", "distance_mi": 620, "drive_time_min": 570}', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '16:30', '17:15', 'Dinner stop — Nashville', 'meal', 'Quick food stop. 45 min max. Gas up both vans.', 'Nashville', NULL, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '17:15', '21:30', 'Drive: Nashville → Terre Haute', 'travel', 'Final leg home. Push through. Almost there.', 'I-65 N to I-70 E', '{"destination": "Terre Haute, IN", "distance_mi": 260, "drive_time_min": 255}', 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '21:30', NULL, 'Arrive Rose-Hulman', 'other', 'Unload vans. Return gear to tennis center. Welcome home.', 'Hulbert Tennis Center', NULL, 60);


-- ============================================================================
-- 3. TRIP_MEALS (~16 rows with recipes)
-- ============================================================================

-- ---------- Sat Feb 28 ----------
INSERT INTO trip_meals (trip_id, day_date, meal_type, name, description, recipe_content, prep_time_min, cook_time_min, nutrition, sort_order) VALUES
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', 'dinner', 'Quick Sandwiches', 'No-cook first night. Build your own sandwiches from travel supplies.', E'# Quick Sandwiches (Sat Night)\n\n**Serves:** 12 | **No cooking required**\n\n## Ingredients\n- 2 loaves bread\n- Peanut butter & jelly\n- Deli turkey (if purchased)\n- Cheese slices\n- Mustard, mayo\n- Chips on the side\n\n## Instructions\n1. Set out all sandwich supplies on the counter\n2. Everyone builds their own\n3. Clean up — wipe counter, put away leftovers\n\n## Roles\n- **Everyone:** Self-serve\n- **Last person done:** Wipe counter and put away supplies', 5, 0, '{"kcal": 600, "carbs_g": 70, "protein_g": 25, "fat_g": 20}', 10),

-- ---------- Sun Mar 1 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', 'breakfast', 'Oatmeal, Fruit & Toast', 'Quick high-carb breakfast before morning practice.', E'# Breakfast — Oatmeal, Fruit & Toast\n\n**Serves:** 12 | **Prep:** 5 min | **Cook:** 10 min\n\n## Ingredients\n- 1 canister oats\n- Bananas (1 per person)\n- 1 loaf bread\n- Peanut butter\n- Jelly\n\n## Instructions\n1. Boil large pot of water\n2. Add oats, stir for 3-5 min\n3. Toast bread in batches\n4. Slice bananas\n5. Serve buffet-style\n\n## Roles\n- **Person A:** Boil water and make oatmeal\n- **Person B:** Run toaster and slice bananas\n- **Everyone:** Self-serve, wash own bowl', 5, 10, '{"kcal": 550, "carbs_g": 85, "protein_g": 15, "fat_g": 12}', 10),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', 'lunch', 'Sandwiches & Wraps', 'Quick lunch between sessions. Build your own from supplies.', E'# Lunch — Sandwiches & Wraps\n\n**Serves:** 12 | **No cooking**\n\n## Ingredients\n- Bread and tortillas\n- Peanut butter, jelly\n- Cheese, lettuce, tomato\n- Mayo, mustard\n- Chips, fruit\n\n## Instructions\n1. Set out supplies\n2. Everyone builds their own\n3. Pack extras for court if needed\n4. Clean up before leaving', 5, 0, '{"kcal": 650, "carbs_g": 80, "protein_g": 28, "fat_g": 22}', 20),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', 'dinner', 'Big Baked Pasta', 'Feeds the whole team. High-carb recovery dinner after first full match day.', E'# Big Baked Pasta\n\n**Serves:** 12 | **Prep:** 20 min | **Cook:** 45 min\n**Target:** ~3200 kcal, 450g carbs, 140g protein\n\n## Ingredients\n- 5 lb ground beef\n- 6 jars marinara sauce (24 oz each)\n- 4 lb penne pasta\n- 2 lb shredded mozzarella\n- Olive oil\n- Salt, pepper, garlic powder\n\n## Instructions\n\n### Step 1 — Boil pasta (Person A & B)\n1. Fill both large pots with water, salt generously\n2. Bring to rolling boil\n3. Cook penne 2 min short of package directions (it finishes in the oven)\n4. Drain in colander, toss with a drizzle of olive oil to prevent sticking\n\n### Step 2 — Brown beef (Person C & D)\n1. Heat large pan over medium-high\n2. Add ground beef in batches — do not overcrowd\n3. Season with salt, pepper, garlic powder\n4. Break up with spatula, cook until no pink remains (~10 min)\n5. Drain excess fat\n\n### Step 3 — Combine & layer (Person A & C)\n1. Mix browned beef with marinara sauce in the large pot\n2. Preheat oven to 375°F\n3. In baking dishes: layer pasta → meat sauce → mozzarella → repeat\n4. Top with remaining mozzarella\n\n### Step 4 — Bake (Person D monitors)\n1. Cover with aluminum foil\n2. Bake at 375°F for 20 min covered\n3. Remove foil, bake 10 min more until cheese is bubbly and golden\n4. Let rest 5 min before serving\n\n## Roles\n- **Person A:** Boil pasta, help layer\n- **Person B:** Assist pasta, set table\n- **Person C:** Brown beef, help layer\n- **Person D:** Brown beef batch 2, monitor oven\n- **Everyone else:** Set table, pour drinks, get plates ready\n\n## Notes\n- Chicken internal temp n/a (beef dish)\n- Save leftovers in containers for tomorrow''s lunch\n- Start dish crew as soon as dinner is served', 20, 45, '{"kcal": 3200, "carbs_g": 450, "protein_g": 140, "fat_g": 88}', 30),

-- ---------- Mon Mar 2 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', 'breakfast', 'Oatmeal, Fruit & Toast', 'Same quick breakfast. Fuel up for double session.', E'# Breakfast — Oatmeal, Fruit & Toast\n\nSame as Sunday. See Sunday breakfast recipe.\n\n- Boil oats, toast bread, slice fruit\n- Self-serve, wash own bowl', 5, 10, '{"kcal": 550, "carbs_g": 85, "protein_g": 15, "fat_g": 12}', 10),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', 'lunch', 'Sandwiches & Wraps', 'Quick lunch. Use any leftover pasta from last night too.', E'# Lunch — Sandwiches & Wraps\n\nSame as Sunday lunch. Supplement with leftover baked pasta if available.\n\n- Self-serve from supplies\n- Reheat leftovers in microwave if desired', 5, 0, '{"kcal": 650, "carbs_g": 80, "protein_g": 28, "fat_g": 22}', 20),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', 'dinner', 'Chicken Stir-Fry Rice Bowls', 'Asian-style bowls. High protein, solid carbs from rice.', E'# Chicken Stir-Fry Rice Bowls\n\n**Serves:** 12 | **Prep:** 25 min | **Cook:** 35 min\n**Target:** ~3000 kcal, 420g carbs, 145g protein\n\n## Ingredients\n- 8 lb chicken thighs (boneless, skinless)\n- 10 cups white rice (uncooked)\n- 2 bags stir-fry vegetables (frozen or fresh bell peppers, broccoli, snap peas)\n- 4 tbsp soy sauce\n- 2 tbsp sesame oil\n- Olive oil\n- Salt, pepper, garlic powder\n- Optional: hot sauce, sriracha\n\n## Instructions\n\n### Step 1 — Cook rice (Person A)\n1. Rinse 10 cups rice in colander\n2. Use both large pots: 5 cups rice + 10 cups water each\n3. Bring to boil, reduce to low, cover, cook 18 min\n4. Fluff with fork, keep covered until serving\n\n### Step 2 — Prep & cook chicken (Person B & C)\n1. Cut chicken thighs into 1-inch strips\n2. Season with salt, pepper, garlic powder\n3. Heat large pan with olive oil over medium-high\n4. Cook chicken in batches — do not overcrowd\n5. Cook 5-6 min per side until internal temp reaches **165°F**\n6. Slice into bite-size pieces\n\n### Step 3 — Stir-fry veggies (Person D)\n1. Heat second pan with sesame oil\n2. Add vegetables, stir-fry 5-7 min until tender-crisp\n3. Add soy sauce in last minute\n4. Season to taste\n\n### Step 4 — Assemble bowls\n1. Base: large scoop of rice\n2. Top with chicken strips\n3. Side of stir-fry vegetables\n4. Drizzle soy sauce and hot sauce to taste\n\n## Roles\n- **Person A:** Rice — both pots, start to finish\n- **Person B:** Prep chicken (cut, season)\n- **Person C:** Cook chicken in batches\n- **Person D:** Stir-fry vegetables\n- **Everyone else:** Set table, pour drinks, assemble own bowls\n\n## Notes\n- **Chicken must reach 165°F internal** — use thermometer\n- Save leftover rice for tomorrow if any\n- Thaw ground beef tonight for Taco Tuesday', 25, 35, '{"kcal": 3000, "carbs_g": 420, "protein_g": 145, "fat_g": 72}', 30),

-- ---------- Tue Mar 3 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', 'breakfast', 'Oatmeal, Bananas & PBJ Toast', 'Quick breakfast. Same routine.', E'# Breakfast — Oatmeal, Bananas & PBJ Toast\n\nSame pattern. Oats, sliced bananas, toast with PB&J.\n\n- Person A: oatmeal\n- Person B: toast and fruit\n- Self-serve, wash own bowl', 5, 10, '{"kcal": 550, "carbs_g": 85, "protein_g": 15, "fat_g": 12}', 10),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', 'lunch', 'Sandwiches & Fruit', 'Quick lunch between sessions.', E'# Lunch — Sandwiches & Fruit\n\nSelf-serve sandwiches. Use up remaining deli supplies.\nFruit, chips, Gatorade on the side.', 5, 0, '{"kcal": 650, "carbs_g": 80, "protein_g": 28, "fat_g": 22}', 20),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', 'dinner', 'Taco Bar', 'Build-your-own taco and burrito night. Fan favorite.', E'# Taco Bar Night\n\n**Serves:** 12 | **Prep:** 15 min | **Cook:** 20 min\n**Target:** ~2800 kcal, 350g carbs, 130g protein\n\n## Ingredients\n- 6 lb ground beef\n- 4 packets taco seasoning\n- 30 hard taco shells (3 boxes of 12)\n- 8 large flour tortillas\n- 2 lb shredded cheddar cheese\n- 2 heads lettuce, shredded\n- 6 tomatoes, diced\n- 2 tubs sour cream\n- 2 jars salsa\n- Hot sauce\n- Limes\n\n## Instructions\n\n### Step 1 — Brown beef (Person A & B)\n1. Heat both large pans over medium-high\n2. Split 6 lb beef between pans\n3. Break up with spatula, cook until no pink (~10 min)\n4. Drain fat\n5. Add 2 packets taco seasoning + water per package directions to each pan\n6. Simmer 5 min\n\n### Step 2 — Prep toppings (Person C & D)\n1. Shred lettuce into large bowl\n2. Dice tomatoes into bowl\n3. Open sour cream, salsa, cheese into serving bowls\n4. Cut limes into wedges\n5. Warm taco shells in oven at 325°F for 5 min\n\n### Step 3 — Set up taco bar\n1. Seasoned beef in center (both pans)\n2. Line up toppings: shells → tortillas → beef → cheese → lettuce → tomato → sour cream → salsa → hot sauce\n3. Everyone builds their own\n\n## Roles\n- **Person A:** Brown beef pan 1, add seasoning\n- **Person B:** Brown beef pan 2, add seasoning\n- **Person C:** Shred lettuce, dice tomatoes\n- **Person D:** Set up topping station, warm shells\n- **Everyone else:** Grab plates and build tacos\n\n## Notes\n- Warm leftover shells in microwave if they get cold\n- Save leftover seasoned beef for tomorrow''s lunch wraps\n- Thaw chicken breast tonight for Wednesday Alfredo', 15, 20, '{"kcal": 2800, "carbs_g": 350, "protein_g": 130, "fat_g": 95}', 30),

-- ---------- Wed Mar 4 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', 'breakfast', 'Oatmeal & Fruit', 'Quick breakfast routine.', E'# Breakfast — Oatmeal & Fruit\n\nSame pattern. Running low on bread — prioritize oatmeal and fruit.\n\n- Oats + bananas + any remaining toast\n- Self-serve', 5, 10, '{"kcal": 500, "carbs_g": 80, "protein_g": 14, "fat_g": 10}', 10),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', 'lunch', 'Wraps & Leftover Taco Meat', 'Use tortillas and leftover taco beef for quick wraps.', E'# Lunch — Wraps & Leftover Taco Meat\n\nHeat leftover taco beef in microwave. Wrap in tortillas with cheese and salsa.\nSupplement with sandwiches and fruit.', 5, 5, '{"kcal": 650, "carbs_g": 75, "protein_g": 35, "fat_g": 25}', 20),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', 'dinner', 'Chicken Alfredo Pasta', 'Creamy pasta with grilled chicken and garlic bread.', E'# Chicken Alfredo Pasta\n\n**Serves:** 12 | **Prep:** 20 min | **Cook:** 35 min\n**Target:** ~3100 kcal, 430g carbs, 150g protein\n\n## Ingredients\n- 8 lb chicken breast (boneless, skinless)\n- 4 lb fettuccine pasta\n- 6 jars alfredo sauce (15 oz each)\n- 2 boxes garlic bread (frozen)\n- Olive oil\n- Salt, pepper, Italian seasoning, garlic powder\n\n## Instructions\n\n### Step 1 — Cook pasta (Person A & B)\n1. Fill both large pots with salted water\n2. Bring to rolling boil\n3. Cook fettuccine to package directions\n4. Drain, toss with olive oil drizzle\n5. Return to pot, keep warm\n\n### Step 2 — Grill chicken (Person C & D)\n1. Slice chicken breasts in half horizontally for even cooking\n2. Season both sides: salt, pepper, Italian seasoning, garlic powder\n3. Heat large pan with olive oil over medium-high\n4. Cook chicken 6-7 min per side until **internal temp 165°F**\n5. Let rest 3 min, then slice into strips\n\n### Step 3 — Heat sauce & garlic bread (Person B)\n1. Pour all alfredo jars into a pot\n2. Heat over medium-low, stirring occasionally — do not boil\n3. Bake garlic bread per package directions (usually 400°F, 8-10 min)\n\n### Step 4 — Combine & serve\n1. Toss pasta with alfredo sauce in the large pot\n2. Plate pasta, top with sliced chicken\n3. Serve garlic bread on the side\n\n## Roles\n- **Person A:** Boil pasta, drain\n- **Person B:** Heat alfredo sauce, bake garlic bread\n- **Person C:** Prep chicken (slice, season)\n- **Person D:** Cook chicken, slice when done\n- **Everyone else:** Set table, pour drinks, plate up\n\n## Notes\n- **Chicken must reach 165°F** — check with thermometer\n- This is the last big dinner — use up remaining garlic bread\n- Save any leftover pasta for Thursday use-it-up dinner', 20, 35, '{"kcal": 3100, "carbs_g": 430, "protein_g": 150, "fat_g": 85}', 30),

-- ---------- Thu Mar 5 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', 'breakfast', 'Last Breakfast — Oatmeal & Remaining Fruit', 'Use up remaining breakfast supplies.', E'# Last Breakfast\n\nFinish the oats, bananas, any remaining bread.\nTravel snacks packed separately for tomorrow.', 5, 10, '{"kcal": 500, "carbs_g": 80, "protein_g": 14, "fat_g": 10}', 10),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', 'lunch', 'Last Lunch — Use Remaining Supplies', 'Finish sandwich supplies, leftover pasta, whatever is left.', E'# Last Lunch\n\nClean out the fridge. Use all remaining sandwich supplies, leftover pasta, wraps.\nAnything perishable gets eaten or tossed today.', 5, 0, '{"kcal": 600, "carbs_g": 70, "protein_g": 25, "fat_g": 20}', 20),

((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', 'dinner', 'Use-It-Up Dinner', 'Last dinner. Combine all remaining food — leftover pasta, rice, chicken, veggies.', E'# Use-It-Up Dinner\n\n**Serves:** 12 | **Prep:** 10 min | **Cook:** 15 min\n\nNo recipe needed. Heat up and combine whatever is left:\n- Leftover pasta and sauce\n- Remaining rice\n- Any leftover chicken\n- Remaining vegetables\n\n## Instructions\n1. Check fridge for all leftovers\n2. Reheat in microwave or stovetop to **165°F**\n3. Serve buffet-style\n4. Toss anything that won''t travel\n\n## After Dinner\n- **Deep clean the kitchen** — this is the big one\n- Wipe inside of fridge\n- Clean oven, stove, counters\n- Take out all trash\n- Leave kitchen better than we found it', 10, 15, '{"kcal": 700, "carbs_g": 80, "protein_g": 35, "fat_g": 25}', 30),

-- ---------- Fri Mar 6 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', 'breakfast', 'Grab-and-Go Breakfast', 'Granola bars, fruit, whatever is left. Eat in the van.', E'# Grab-and-Go Breakfast\n\nNo cooking. Grab from the remaining supplies:\n- Granola bars\n- Any remaining fruit\n- Trail mix\n- Water bottles\n\nEat in the van. We need to be on the road by 7:00 AM.', 5, 0, '{"kcal": 400, "carbs_g": 60, "protein_g": 10, "fat_g": 15}', 10);


-- ============================================================================
-- 4. TRIP_GROCERY_ITEMS (~80 rows)
-- ============================================================================

-- ---------- PRODUCE (Alpha Team) ----------
INSERT INTO trip_grocery_items (trip_id, item_name, quantity, estimated_price, category, shopping_team, meal_use, sort_order) VALUES
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Bananas', '2 bunches', 1.50, 'produce', 'alpha', 'Breakfast daily', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Apples', 'Bag of 12', 5.99, 'produce', 'alpha', 'Snacks, breakfast', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Lettuce', '2 heads', 3.98, 'produce', 'alpha', 'Tacos, sandwiches', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Tomatoes', '6', 4.99, 'produce', 'alpha', 'Tacos, sandwiches', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Onions', 'Bag of 3', 2.99, 'produce', 'alpha', 'Stir-fry, tacos', 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Bell peppers', '6', 5.94, 'produce', 'alpha', 'Stir-fry, tacos', 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Limes', '1 bag', 2.99, 'produce', 'alpha', 'Tacos, drinks', 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Avocados', '6', 5.94, 'produce', 'alpha', 'Tacos, sandwiches', 80),

-- ---------- MEAT (Bravo Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Ground beef 5 lb', '2 packages', 22.00, 'meat', 'bravo', 'Baked pasta (Sun), tacos (Tue)', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Chicken thighs 8 lb', '1 package', 18.99, 'meat', 'bravo', 'Stir-fry (Mon)', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Chicken breast 8 lb', '1 package', 21.99, 'meat', 'bravo', 'Alfredo (Wed)', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Taco seasoning packets', '4 packets', 4.00, 'meat', 'bravo', 'Tacos (Tue)', 40),

-- ---------- DAIRY (Alpha Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Milk (gallon)', '1', 3.49, 'dairy', 'alpha', 'Oatmeal, cereal, drinking', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Shredded mozzarella 2 lb', '2 bags', 9.98, 'dairy', 'alpha', 'Baked pasta (Sun)', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Shredded cheddar 2 lb', '1 bag', 5.99, 'dairy', 'alpha', 'Tacos (Tue)', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Sour cream', '2 tubs', 4.98, 'dairy', 'alpha', 'Tacos (Tue)', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Butter', '2 sticks', 4.98, 'dairy', 'alpha', 'Cooking, toast', 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Eggs (dozen)', '2 dozen', 5.98, 'dairy', 'alpha', 'Backup breakfast', 60),

-- ---------- BAKERY (Charlie Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Bread loaves', '8 loaves', 15.92, 'bakery', 'charlie', 'Sandwiches daily, toast', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Hamburger buns', '2 packs', 5.98, 'bakery', 'charlie', 'Backup sandwiches', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Flour tortillas 8-pack', '2 packs', 5.98, 'bakery', 'charlie', 'Wraps, burritos', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Taco shells 12 ct', '3 boxes', 8.97, 'bakery', 'charlie', 'Tacos (Tue)', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Garlic bread (frozen)', '2 boxes', 7.98, 'bakery', 'charlie', 'Alfredo dinner (Wed)', 50),

-- ---------- DRY GOODS (Bravo Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Penne pasta 1 lb', '4 boxes', 4.76, 'dry_goods', 'bravo', 'Baked pasta (Sun)', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Fettuccine pasta 1 lb', '4 boxes', 4.76, 'dry_goods', 'bravo', 'Alfredo (Wed)', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'White rice 5 lb bag', '2 bags', 7.98, 'dry_goods', 'bravo', 'Stir-fry (Mon)', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Oats canister', '2 canisters', 7.98, 'dry_goods', 'bravo', 'Breakfast daily', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Peanut butter', '2 jars', 6.98, 'dry_goods', 'bravo', 'Breakfast, sandwiches', 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Jelly/jam', '2 jars', 5.98, 'dry_goods', 'bravo', 'Breakfast, sandwiches', 60),

-- ---------- CANNED / JARS (Charlie Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Marinara sauce 24 oz', '6 jars', 11.94, 'canned', 'charlie', 'Baked pasta (Sun)', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Alfredo sauce 15 oz', '6 jars', 11.94, 'canned', 'charlie', 'Alfredo (Wed)', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Salsa', '2 jars', 5.98, 'canned', 'charlie', 'Tacos (Tue)', 30),

-- ---------- CONDIMENTS (Charlie Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Soy sauce', '1 bottle', 2.99, 'condiments', 'charlie', 'Stir-fry (Mon)', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Sesame oil', '1 bottle', 3.99, 'condiments', 'charlie', 'Stir-fry (Mon)', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Olive oil', '1 bottle', 5.99, 'condiments', 'charlie', 'Cooking daily', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Hot sauce', '1 bottle', 2.49, 'condiments', 'charlie', 'Tacos, stir-fry, general', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Ranch dressing', '1 bottle', 3.49, 'condiments', 'charlie', 'Salads, dipping', 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Mayonnaise', '1 jar', 3.99, 'condiments', 'charlie', 'Sandwiches', 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Mustard', '1 bottle', 1.99, 'condiments', 'charlie', 'Sandwiches', 70),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Ketchup', '1 bottle', 2.99, 'condiments', 'charlie', 'General use', 80),

-- ---------- SPICES (Bravo Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Salt', '1 canister', 1.29, 'spices', 'bravo', 'Cooking daily', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Black pepper', '1 container', 2.49, 'spices', 'bravo', 'Cooking daily', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Garlic powder', '1 container', 2.49, 'spices', 'bravo', 'Pasta, chicken, stir-fry', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Italian seasoning', '1 container', 2.49, 'spices', 'bravo', 'Alfredo chicken (Wed)', 40),

-- ---------- BREAKFAST (Alpha Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Granola bars', '3 boxes', 11.97, 'breakfast', 'alpha', 'Snacks, grab-and-go breakfast', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Cereal (large box)', '1 box', 4.49, 'breakfast', 'alpha', 'Backup breakfast option', 20),

-- ---------- SNACKS (Alpha Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Trail mix', '2 bags', 9.98, 'snacks', 'alpha', 'Snacks, match day energy', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Chips', '3 bags', 8.97, 'snacks', 'alpha', 'Lunch sides, free time', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Pretzels', '2 bags', 5.98, 'snacks', 'alpha', 'Snacks', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Crackers', '2 boxes', 5.98, 'snacks', 'alpha', 'Snacks with PB', 40),

-- ---------- BEVERAGES (Bravo Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Gatorade powder canister', '2 canisters', 13.98, 'beverages', 'bravo', 'Match day hydration', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Water cases (24 pk)', '3 cases', 11.97, 'beverages', 'bravo', 'Daily hydration', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Orange juice (gallon)', '2 gallons', 7.98, 'beverages', 'bravo', 'Breakfast', 30),

-- ---------- FROZEN (Charlie Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Frozen stir-fry vegetables', '4 bags', 11.96, 'frozen', 'charlie', 'Stir-fry (Mon)', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Frozen broccoli', '2 bags', 5.98, 'frozen', 'charlie', 'Side dish option', 20),

-- ---------- HOUSEHOLD (Charlie Team) ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Paper towels (6-roll)', '1 pack', 5.99, 'household', 'charlie', 'Kitchen cleanup daily', 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Trash bags (13 gal)', '1 box', 4.99, 'household', 'charlie', 'Kitchen and rooms', 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Dish soap', '1 bottle', 3.49, 'household', 'charlie', 'Dish crew daily', 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Sponges (3-pack)', '1 pack', 2.99, 'household', 'charlie', 'Dish crew daily', 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Aluminum foil', '1 roll', 3.99, 'household', 'charlie', 'Baking, covering food', 50),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Zip-lock bags (gallon)', '1 box', 3.49, 'household', 'charlie', 'Leftovers, snack packing', 60),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), 'Plastic wrap', '1 roll', 2.99, 'household', 'charlie', 'Covering leftovers', 70);


-- ============================================================================
-- 5. TRIP_TASKS (~40 rows)
-- ============================================================================

-- ---------- Sat Feb 28 — Walmart Shopping Run ----------
INSERT INTO trip_tasks (trip_id, day_date, time_slot, title, description, category, slots_needed, sort_order) VALUES
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '21:00', 'Shopping Team Alpha — Produce & Dairy', 'Produce and dairy sections at Walmart. See grocery list filtered by Team Alpha. Meet at checkout in 25 min.', 'shopping', 3, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '21:00', 'Shopping Team Bravo — Meat & Dry Goods', 'Meat, dry goods, beverages, and spices at Walmart. See grocery list filtered by Team Bravo. Meet at checkout in 25 min.', 'shopping', 3, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '21:00', 'Shopping Team Charlie — Bakery, Canned, Household', 'Bakery, canned goods, condiments, frozen, and household at Walmart. See grocery list filtered by Team Charlie. Meet at checkout in 25 min.', 'shopping', 3, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-02-28', '21:30', 'Organize Kitchen & Fridge', 'Unpack all groceries. Follow fridge zone labels: top shelf drinks, middle dairy/eggs, bottom raw meat, door condiments, freezer chicken/ice.', 'cleanup', 4, 40),

-- ---------- Sun Mar 1 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '07:30', 'Match Bag Packing', 'Pack match bags: rackets, water bottles, towels, snacks, grip tape. Sunscreen station by the door.', 'packing', 2, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '17:00', 'Cooking Team — Big Baked Pasta', 'Cook dinner. See recipe in Meals tab. Brown beef, boil pasta, layer and bake. Starts at 5 PM.', 'cooking', 3, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '19:30', 'Dish Crew', 'Wash all dishes, pots, pans. Wipe down sink. Dry and put away.', 'dishes', 2, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '19:30', 'Kitchen Wipe', 'Wipe counters, stove, table after dinner. Sweep floor if needed.', 'cleanup', 1, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-01', '22:00', 'Night-Before Prep', 'Thaw chicken thighs for Monday stir-fry. Move from freezer to fridge. Set out breakfast supplies for morning.', 'night_prep', 2, 50),

-- ---------- Mon Mar 2 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '07:30', 'Match Bag Packing', 'Pack match bags for double session day.', 'packing', 2, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '17:30', 'Cooking Team — Chicken Stir-Fry', 'Cook dinner. See recipe in Meals tab. Rice in both pots, cook chicken to 165°F, stir-fry veggies.', 'cooking', 3, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '19:30', 'Dish Crew', 'Wash all dishes, pots, pans. Wipe down sink.', 'dishes', 2, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '19:30', 'Kitchen Wipe', 'Wipe counters, stove, table after dinner.', 'cleanup', 1, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-02', '22:00', 'Night-Before Prep', 'Thaw ground beef for Taco Tuesday. Move from freezer to fridge. Set out taco seasoning packets and shells.', 'night_prep', 2, 50),

-- ---------- Tue Mar 3 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '07:30', 'Match Bag Packing', 'Pack match bags.', 'packing', 2, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '17:30', 'Cooking Team — Taco Bar', 'Cook dinner. See recipe in Meals tab. Brown beef with seasoning, prep all toppings, warm shells.', 'cooking', 3, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '19:30', 'Dish Crew', 'Wash all dishes, pots, pans. Wipe down sink.', 'dishes', 2, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '19:30', 'Kitchen Wipe', 'Wipe counters, stove, table after dinner. Extra attention to taco mess.', 'cleanup', 1, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-03', '22:00', 'Night-Before Prep', 'Thaw chicken breast for Wednesday Alfredo. Move from freezer to fridge. Set out garlic bread boxes.', 'night_prep', 2, 50),

-- ---------- Wed Mar 4 ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '07:30', 'Match Bag Packing', 'Pack match bags. Amanda''s last match day.', 'packing', 2, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '17:30', 'Cooking Team — Chicken Alfredo', 'Cook dinner. See recipe in Meals tab. Grill chicken to 165°F, boil fettuccine, heat alfredo, bake garlic bread.', 'cooking', 3, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '19:30', 'Dish Crew', 'Wash all dishes, pots, pans. Wipe down sink.', 'dishes', 2, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-04', '19:30', 'Kitchen Wipe', 'Wipe counters, stove, table after dinner.', 'cleanup', 1, 40),

-- ---------- Thu Mar 5 — Departure Prep ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '07:30', 'Match Bag Packing — Final Day', 'Last match day. Bring everything from courts — nothing stays behind.', 'packing', 2, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '18:00', 'Dish Crew — Final Deep Wash', 'Wash every dish, pot, pan, utensil. Clean inside of fridge. Leave kitchen spotless for checkout.', 'dishes', 3, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '18:00', 'Kitchen Deep Clean', 'Wipe inside of fridge, clean oven and stovetop, scrub counters, sweep and mop floor. Checkout standard.', 'cleanup', 2, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '19:00', 'Van Loading', 'Load all luggage, tennis bags, coolers, and gear into both vans. Organize for easy unload at Rose-Hulman.', 'packing', 4, 40),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-05', '19:00', 'Trash Removal', 'Collect trash from every room, kitchen, bathrooms. Take all bags to resort dumpster.', 'cleanup', 2, 50),

-- ---------- Fri Mar 6 — Checkout ----------
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '06:00', 'Final Kitchen Deep Clean', 'Last pass on kitchen. Wipe all surfaces, check fridge is empty, verify stove is off. Leave perfect.', 'cleanup', 3, 10),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '06:00', 'Bathroom & Bedroom Check', 'Check all bedrooms and bathrooms. Look under beds, in closets, in shower. Strip beds if required. Nothing left behind.', 'cleanup', 2, 20),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '06:00', 'Trash Removal — Final', 'Last sweep for any remaining trash. Check all rooms. Take bags to dumpster.', 'cleanup', 2, 30),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), '2026-03-06', '06:15', 'Van Final Check', 'Verify all luggage and gear is loaded. Head count. Cooler with road snacks and water accessible.', 'packing', 2, 40);


-- ============================================================================
-- 6. TRIP_STAFF_ROSTER (4 rows)
-- ============================================================================

INSERT INTO trip_staff_roster (trip_id, staff_id, name, role_on_trip, start_date, end_date, notes) VALUES
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), (SELECT id FROM staff WHERE email = 'wilson9@rose-hulman.edu'), 'Matt Wilson', 'Head Coach', '2026-02-28', '2026-03-06', 'Full trip. Runs all practices and matches. Van 1 primary driver.'),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), (SELECT id FROM staff WHERE email = 'lubold@rose-hulman.edu'), 'Amanda Lubold', 'Assistant Coach', '2026-02-28', '2026-03-04', 'Departs Wednesday afternoon after morning session.'),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), NULL, 'Coach Kacey', 'Driver & Assistant', '2026-03-04', '2026-03-06', 'Arrives Wednesday to drive second van for return trip.'),
((SELECT id FROM trips WHERE name = 'Spring Break Florida Trip'), NULL, 'Chris Lian', 'Player-Captain & Driver', '2026-02-28', '2026-03-06', 'Drives van 2 on southbound leg and as needed. Captain responsibilities for player coordination.');
