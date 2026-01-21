-- Rose-Hulman Tennis App - Database Seed
-- Run after schema creation in Supabase

-- =====================================================
-- TAGS (schema: name, color - no description)
-- =====================================================
INSERT INTO tags (name, color) VALUES
  ('varsity', '#800000'),
  ('jv', '#B3B2B1'),
  ('florida_trip', '#E87722'),
  ('injured', '#dc2626'),
  ('captain', '#800000')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STAFF (schema: first_name, last_name, email, title, role)
-- role must be: head_coach, assistant_coach, trainer
-- =====================================================
INSERT INTO staff (first_name, last_name, email, title, role) VALUES
  ('Matt', 'Wilson', 'wilson9@rose-hulman.edu', 'Head Coach', 'head_coach'),
  ('Amanda', 'Lubold', 'lubold@rose-hulman.edu', 'Assistant Coach', 'assistant_coach'),
  ('Craig', 'Clark', 'clarkc@rose-hulman.edu', 'Assistant Coach', 'assistant_coach'),
  ('Percy', 'Mossbarger', 'mossbarger@rose-hulman.edu', 'Assistant Coach', 'assistant_coach'),
  ('Alison', 'Kirchner', 'kirchner@rose-hulman.edu', 'Assistant Coach', 'assistant_coach'),
  ('Kristen', 'Kauffman', 'kauffman@rose-hulman.edu', 'Athletic Trainer', 'trainer')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PLAYERS - MEN'S TEAM
-- schema: first_name, last_name, email, gender, class_year, is_captain, is_active
-- gender must be: male, female
-- =====================================================
INSERT INTO players (first_name, last_name, email, gender, class_year, is_captain, is_active) VALUES
  ('Eoin', 'Anto', 'antoer@rose-hulman.edu', 'male', 'Fr', false, true),
  ('Ryan', 'Burch', 'burchrm@rose-hulman.edu', 'male', 'Sr', false, true),
  ('Tim', 'Eckermann', 'eckermtc@rose-hulman.edu', 'male', 'So', false, true),
  ('Ephraim', 'Guthrie', 'guthrieh@rose-hulman.edu', 'male', 'So', false, true),
  ('Matt', 'Hydrick', 'hydricms@rose-hulman.edu', 'male', 'So', false, true),
  ('Andrew', 'Leonard', 'leonara1@rose-hulman.edu', 'male', 'Sr', false, true),
  ('Chris', 'Lian', 'lianc@rose-hulman.edu', 'male', 'Jr', true, true),
  ('Dale', 'Loveland', 'loveladr@rose-hulman.edu', 'male', 'Jr', false, true),
  ('Nicholas', 'Loveland', 'lovelanj@rose-hulman.edu', 'male', 'Fr', false, true),
  ('Eli', 'McIntyre', 'mcintyej@rose-hulman.edu', 'male', 'So', false, true),
  ('Andrés', 'Munoz Coryn', 'munozca@rose-hulman.edu', 'male', 'Fr', false, true),
  ('Joao Henrique', 'Nossar Reis da Rocha', 'nossarj@rose-hulman.edu', 'male', 'So', false, true),
  ('Ervin', 'Perkowski', 'perkowe@rose-hulman.edu', 'male', 'Jr', false, true),
  ('Renato', 'Prado', 'pradord@rose-hulman.edu', 'male', 'Sr', true, true),
  ('Jayden', 'Scott', 'scottjm3@rose-hulman.edu', 'male', 'Fr', false, true),
  ('Jonathon', 'Stadler', 'stadlejp@rose-hulman.edu', 'male', 'Sr', false, true);

-- =====================================================
-- PLAYERS - WOMEN'S TEAM
-- =====================================================
INSERT INTO players (first_name, last_name, email, gender, class_year, is_captain, is_active) VALUES
  ('Julia', 'Burt', 'burtjj@rose-hulman.edu', 'female', 'So', false, true),
  ('Brooke', 'Carpenter', 'carpenb1@rose-hulman.edu', 'female', 'Jr', false, true),
  ('Camille', 'Clark', 'clarkcc@rose-hulman.edu', 'female', 'Sr', true, true),
  ('Emerson', 'Donaldson', 'donalden@rose-hulman.edu', 'female', 'So', false, true),
  ('Nova', 'Gladden', 'gladdenb@rose-hulman.edu', 'female', 'So', false, true),
  ('Abby', 'Kallio', 'kallioam@rose-hulman.edu', 'female', 'So', false, true),
  ('Autumn', 'Korey', 'koreyae@rose-hulman.edu', 'female', 'Fr', false, true),
  ('Isha', 'Mannan', 'mannani@rose-hulman.edu', 'female', 'So', false, true),
  ('Paige', 'Mills', 'millspe@rose-hulman.edu', 'female', 'Fr', false, true),
  ('Addie', 'Patterson', 'patteral@rose-hulman.edu', 'female', 'So', false, true),
  ('Katie', 'Pfund', 'pfundkh@rose-hulman.edu', 'female', 'So', false, true),
  ('Lia', 'Taylor', 'taylorlm@rose-hulman.edu', 'female', 'So', false, true);

-- =====================================================
-- PLAYER TAGS (Varsity, JV, Captain)
-- =====================================================

-- Men's Varsity: Joao, Ervin, Ephraim, Tim, Chris, Renato, Matt, Eli, Andrew
INSERT INTO player_tags (player_id, tag_id)
SELECT p.id, t.id FROM players p, tags t
WHERE t.name = 'varsity' AND p.email IN (
  'nossarj@rose-hulman.edu',    -- Joao
  'perkowe@rose-hulman.edu',    -- Ervin
  'guthrieh@rose-hulman.edu',   -- Ephraim
  'eckermtc@rose-hulman.edu',   -- Tim
  'lianc@rose-hulman.edu',      -- Chris
  'pradord@rose-hulman.edu',    -- Renato
  'hydricms@rose-hulman.edu',   -- Matt
  'mcintyej@rose-hulman.edu',   -- Eli
  'leonara1@rose-hulman.edu'    -- Andrew
);

-- Men's JV: Eoin, Ryan, Dale, Nick, Andrés, Jayden, Jonathon
INSERT INTO player_tags (player_id, tag_id)
SELECT p.id, t.id FROM players p, tags t
WHERE t.name = 'jv' AND p.email IN (
  'antoer@rose-hulman.edu',     -- Eoin
  'burchrm@rose-hulman.edu',    -- Ryan
  'loveladr@rose-hulman.edu',   -- Dale
  'lovelanj@rose-hulman.edu',   -- Nick
  'munozca@rose-hulman.edu',    -- Andrés
  'scottjm3@rose-hulman.edu',   -- Jayden
  'stadlejp@rose-hulman.edu'    -- Jonathon
);

-- Women's Varsity: Lia, Emerson, Addie, Katie, Julia, Nova, Camille, Paige, Autumn
INSERT INTO player_tags (player_id, tag_id)
SELECT p.id, t.id FROM players p, tags t
WHERE t.name = 'varsity' AND p.email IN (
  'taylorlm@rose-hulman.edu',   -- Lia
  'donalden@rose-hulman.edu',   -- Emerson
  'patteral@rose-hulman.edu',   -- Addie
  'pfundkh@rose-hulman.edu',    -- Katie
  'burtjj@rose-hulman.edu',     -- Julia
  'gladdenb@rose-hulman.edu',   -- Nova
  'clarkcc@rose-hulman.edu',    -- Camille
  'millspe@rose-hulman.edu',    -- Paige
  'koreyae@rose-hulman.edu'     -- Autumn
);

-- Women's JV: Brooke, Abby, Isha
INSERT INTO player_tags (player_id, tag_id)
SELECT p.id, t.id FROM players p, tags t
WHERE t.name = 'jv' AND p.email IN (
  'carpenb1@rose-hulman.edu',   -- Brooke
  'kallioam@rose-hulman.edu',   -- Abby
  'mannani@rose-hulman.edu'     -- Isha
);

-- Captains: Chris Lian, Renato Prado (Men), Camille Clark (Women)
INSERT INTO player_tags (player_id, tag_id)
SELECT p.id, t.id FROM players p, tags t
WHERE t.name = 'captain' AND p.email IN (
  'lianc@rose-hulman.edu',
  'pradord@rose-hulman.edu',
  'clarkcc@rose-hulman.edu'
);

-- =====================================================
-- EVENTS - JANUARY 2026
-- Schema: title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes, meeting_notes
-- event_type must be: practice, match, fitness, meeting, scrimmage, trip, other
-- =====================================================
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes, meeting_notes) VALUES
  ('Winter/Spring Team Meeting', 'meeting', '2026-01-20', '17:00', '18:30', 'MPR', true, true, NULL,
   '📋 SUMMARY
Coach Wilson covered spring quarter expectations, travel logistics for Michigan (Feb 13-14) and Florida (Feb 28-Mar 6), and the practice schedule balancing fitness days at SRC with bubble court time. Emphasized team focus and efficiency, using IU football''s championship run as motivation for both teams to either defend their title (men) or make program history (women).

📌 KEY POINTS
• Schedule structure: Fitness days (SRC conditioning) vs Bubble days (court practice) — times may change weekly
• Michigan trip Feb 13-14: Playing Roosevelt @ Hope and @ Hope; exams proctored at hotel if needed
• Florida trip approved: 9 men + 9 women, leaving Feb 28, returning Mar 6
• Southwest checked bag policy: Now $35 first bag, $25 second
• Bubble access: Limited by budget to 2-3 days/week
• Practice expectations: Be on time, ready to go quickly; efficiency is critical
• Home matches: ALL players expected to attend and support
• Captains: Camille Clark (W), Chris Lian & Renato Prado (M)
• Men''s goal: Defend back-to-back conference titles — "rip the rearview mirror off"
• Women''s goal: Make program history — grew from 4 players to full roster
• Finals week (Feb 23-27): No organized practice

✅ ACTION ITEMS
□ Review match schedule for conflicts → ALL PLAYERS → ASAP
□ Notify professors about Michigan trip absences (Feb 13-14) → ALL PLAYERS → This week
□ Confirm Florida trip attendance → ALL PLAYERS → Before Feb 28
□ Keep Jan 31 afternoon open for scrimmage → ALL PLAYERS → Jan 31

📢 ANNOUNCEMENTS
• Weather policy: If 45-50°F with sun, practice moves outside'),

  ('SRC Fitness', 'fitness', '2026-01-21', '17:00', '18:30', 'SRC', true, true, NULL, NULL),
  ('SRC Fitness', 'fitness', '2026-01-22', '19:00', '20:30', 'SRC', true, true, 'Career fair setup may affect space', NULL),
  ('SRC Fitness', 'fitness', '2026-01-23', '17:00', '18:30', 'SRC', true, true, 'TBA - possible track meet conflict', NULL),
  ('Bubble Practice', 'practice', '2026-01-26', '17:00', '19:00', 'Bubble', true, true, NULL, NULL),
  ('SRC Fitness', 'fitness', '2026-01-27', '19:00', '20:30', 'SRC', true, true, NULL, NULL),
  ('Bubble Practice', 'practice', '2026-01-28', '17:00', '19:00', 'Bubble', true, true, NULL, NULL),
  ('SRC Fitness', 'fitness', '2026-01-29', '19:00', '20:30', 'SRC', true, true, NULL, NULL),
  ('Bubble Practice', 'practice', '2026-01-30', '17:00', '19:00', 'Bubble', true, true, NULL, NULL),
  ('Team Scrimmage', 'scrimmage', '2026-01-31', NULL, NULL, 'TBA', true, true, 'Keep afternoon open', NULL);

-- =====================================================
-- EVENTS - FEBRUARY 2026
-- =====================================================
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes) VALUES
  ('Practice', 'practice', '2026-02-02', '17:00', '19:00', 'TBA', true, true, NULL),
  ('SRC Fitness', 'fitness', '2026-02-03', '19:00', '20:30', 'SRC', true, true, NULL),
  ('Practice', 'practice', '2026-02-04', '17:00', '19:00', 'TBA', true, true, NULL),
  ('SRC Fitness', 'fitness', '2026-02-05', '19:00', '20:30', 'SRC', false, true, NULL),
  ('Bubble Practice', 'practice', '2026-02-05', '17:00', '19:00', 'Bubble', true, false, NULL),
  ('Yoga', 'fitness', '2026-02-09', '17:00', '18:00', 'TBA', true, true, NULL),
  ('Practice', 'practice', '2026-02-10', '17:00', '19:00', 'TBA', true, true, NULL),
  ('Practice', 'practice', '2026-02-11', '17:00', '19:00', 'TBA', true, true, NULL),
  ('SRC Fitness', 'fitness', '2026-02-11', '19:00', '20:30', 'SRC', true, true, NULL),
  ('Practice', 'practice', '2026-02-12', '17:00', '19:00', 'TBA', true, true, NULL),
  ('Yoga', 'fitness', '2026-02-16', '17:00', '18:00', 'TBA', true, true, NULL),
  ('Practice', 'practice', '2026-02-17', '17:00', '19:00', 'TBA', true, true, NULL),
  ('SRC Fitness', 'fitness', '2026-02-18', '19:00', '20:30', 'SRC', true, true, NULL),
  ('Practice', 'practice', '2026-02-19', '17:00', '19:00', 'TBA', true, true, NULL),
  ('Finals Week - No Practice', 'other', '2026-02-23', NULL, NULL, NULL, true, true, 'Hit on your own'),
  ('Finals Week - No Practice', 'other', '2026-02-24', NULL, NULL, NULL, true, true, NULL),
  ('SRC Fitness', 'fitness', '2026-02-25', '19:00', '20:30', 'SRC', true, true, NULL),
  ('Practice', 'practice', '2026-02-26', '17:00', '19:00', 'TBA', true, true, NULL),
  ('Practice', 'practice', '2026-02-27', '17:00', '19:00', 'TBA', true, true, NULL);

-- =====================================================
-- MATCHES - with match_details
-- Schema match_details: event_id, opponent, home_away (home/away/neutral)
-- =====================================================

-- Feb 6: Men vs Case Western @ Wabash
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Case Western Reserve', 'match', '2026-02-06', NULL, 'Crawfordsville, IN', true, false, 'Played at Wabash College');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Case Western Reserve', 'neutral' FROM events WHERE event_date = '2026-02-06' AND title = 'vs Case Western Reserve';

-- Feb 7: Women @ IU Kokomo
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ IU Kokomo', 'match', '2026-02-07', NULL, 'Kokomo, IN', false, true, NULL);
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'IU Kokomo', 'away' FROM events WHERE event_date = '2026-02-07' AND title = '@ IU Kokomo';

-- Feb 13: Both @ Hope College (Michigan Trip Day 1)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ Hope College', 'match', '2026-02-13', '14:00', 'Holland, MI', true, true, 'Michigan Trip Day 1');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Hope College', 'away' FROM events WHERE event_date = '2026-02-13' AND title = '@ Hope College';

-- Feb 14: Both vs Roosevelt @ Hope (Michigan Trip Day 2)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Roosevelt', 'match', '2026-02-14', '08:00', 'Holland, MI', true, true, 'Michigan Trip Day 2');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Roosevelt', 'neutral' FROM events WHERE event_date = '2026-02-14' AND title = 'vs Roosevelt';

-- Feb 28: Leave for Florida
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('Leave for Florida', 'trip', '2026-02-28', NULL, 'Orlando, FL', true, true, '9 men + 9 women');

-- =====================================================
-- FLORIDA TRIP MATCHES (Mar 1-5)
-- =====================================================

-- Mar 1: Men vs Adrian (Scrimmage)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Adrian College', 'match', '2026-03-01', NULL, 'Orlando, FL', true, false, 'Florida Trip - Scrimmage');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Adrian College', 'neutral' FROM events WHERE event_date = '2026-03-01' AND title = 'vs Adrian College';

-- Mar 2: Both vs Concordia (WI)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Concordia (WI)', 'match', '2026-03-02', NULL, 'Orlando, FL', true, true, 'Florida Trip');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Concordia (WI)', 'neutral' FROM events WHERE event_date = '2026-03-02' AND title = 'vs Concordia (WI)';

-- Mar 3: Both vs Allegheny
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Allegheny', 'match', '2026-03-03', NULL, 'Orlando, FL', true, true, 'Florida Trip');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Allegheny', 'neutral' FROM events WHERE event_date = '2026-03-03' AND title = 'vs Allegheny';

-- Mar 3: Men vs Cedarville
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Cedarville', 'match', '2026-03-03', NULL, 'Orlando, FL', true, false, 'Florida Trip');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Cedarville', 'neutral' FROM events WHERE event_date = '2026-03-03' AND title = 'vs Cedarville';

-- Mar 5: Both vs Wartburg
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Wartburg', 'match', '2026-03-05', NULL, 'Orlando, FL', true, true, 'Florida Trip');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Wartburg', 'neutral' FROM events WHERE event_date = '2026-03-05' AND title = 'vs Wartburg';

-- Mar 6: Return from Florida
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('Return from Florida', 'trip', '2026-03-06', NULL, 'Terre Haute, IN', true, true, NULL);

-- =====================================================
-- SPRING MATCHES (Mar 14 - May 3)
-- =====================================================

-- Mar 14: Men @ Berea (HCAC)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ Berea', 'match', '2026-03-14', '14:00', 'Berea, KY', true, false, 'HCAC');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Berea', 'away' FROM events WHERE event_date = '2026-03-14' AND title = '@ Berea';

-- Mar 18: Men vs MSOE
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs MSOE', 'match', '2026-03-18', '17:30', 'Joy Hulbert Tennis Center', true, false, NULL);
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Milwaukee School of Engineering', 'home' FROM events WHERE event_date = '2026-03-18' AND title = 'vs MSOE';

-- Mar 21: Men @ Trine
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ Trine', 'match', '2026-03-21', '11:00', 'Angola, IN', true, false, NULL);
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Trine', 'away' FROM events WHERE event_date = '2026-03-21' AND title = '@ Trine';

-- Mar 22: Men vs Franklin (HCAC)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Franklin', 'match', '2026-03-22', '11:00', 'Joy Hulbert Tennis Center', true, false, 'HCAC');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Franklin', 'home' FROM events WHERE event_date = '2026-03-22' AND title = 'vs Franklin';

-- Mar 28: Men vs Wabash (Tri-Match)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Wabash', 'match', '2026-03-28', '10:00', 'Joy Hulbert Tennis Center', true, false, 'Tri-Match');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Wabash', 'home' FROM events WHERE event_date = '2026-03-28' AND title = 'vs Wabash';

-- Mar 28: Men vs Principia (Tri-Match)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Principia', 'match', '2026-03-28', '16:00', 'Joy Hulbert Tennis Center', true, false, 'Tri-Match');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Principia', 'home' FROM events WHERE event_date = '2026-03-28' AND title = 'vs Principia';

-- Apr 4: Men vs Transylvania (HCAC)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Transylvania', 'match', '2026-04-04', '14:00', 'Joy Hulbert Tennis Center', true, false, 'HCAC');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Transylvania', 'home' FROM events WHERE event_date = '2026-04-04' AND title = 'vs Transylvania';

-- Apr 11: Men @ Earlham (HCAC)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ Earlham', 'match', '2026-04-11', '14:00', 'Richmond, IN', true, false, 'HCAC');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Earlham', 'away' FROM events WHERE event_date = '2026-04-11' AND title = '@ Earlham';

-- Apr 15: Men vs Westminster (MO)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Westminster (MO)', 'match', '2026-04-15', '11:00', 'Greenville, IL', true, false, '10 AM CT / 11 AM ET');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Westminster (MO)', 'neutral' FROM events WHERE event_date = '2026-04-15' AND title = 'vs Westminster (MO)';

-- Apr 15: Men @ Greenville
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ Greenville', 'match', '2026-04-15', '14:00', 'Greenville, IL', true, false, '1 PM CT / 2 PM ET');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Greenville', 'away' FROM events WHERE event_date = '2026-04-15' AND title = '@ Greenville';

-- Apr 18: Men vs Anderson (HCAC)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Anderson', 'match', '2026-04-18', '14:00', 'Joy Hulbert Tennis Center', true, false, 'HCAC');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Anderson', 'home' FROM events WHERE event_date = '2026-04-18' AND title = 'vs Anderson';

-- Apr 25: Men @ Hanover (HCAC)
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ Hanover', 'match', '2026-04-25', '14:00', 'Hanover, IN', true, false, 'HCAC');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Hanover', 'away' FROM events WHERE event_date = '2026-04-25' AND title = '@ Hanover';

-- Apr 26: Men vs Manchester (HCAC) - Senior Day
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('vs Manchester', 'match', '2026-04-26', '14:00', 'Joy Hulbert Tennis Center', true, false, 'HCAC - Senior Day');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'Manchester', 'home' FROM events WHERE event_date = '2026-04-26' AND title = 'vs Manchester';

-- =====================================================
-- HCAC TOURNAMENT (Apr 29 - May 3)
-- =====================================================

-- Apr 29: HCAC Quarterfinals
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('HCAC Quarterfinals', 'match', '2026-04-29', NULL, 'TBA', true, false, 'Tournament');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'TBA', 'neutral' FROM events WHERE event_date = '2026-04-29' AND title = 'HCAC Quarterfinals';

-- May 2: HCAC Semifinals
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('HCAC Semifinals', 'match', '2026-05-02', NULL, 'Indianapolis, IN', true, false, 'Tournament');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'TBA', 'neutral' FROM events WHERE event_date = '2026-05-02' AND title = 'HCAC Semifinals';

-- May 3: HCAC Championship
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('HCAC Championship', 'match', '2026-05-03', NULL, 'Indianapolis, IN', true, false, 'Tournament');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'TBA', 'neutral' FROM events WHERE event_date = '2026-05-03' AND title = 'HCAC Championship';

-- =====================================================
-- SUMMARY
-- =====================================================
-- Tags: 5
-- Staff: 6
-- Players: 28 (16 men, 12 women)
-- Player Tags: 28+ (varsity/jv) + 3 (captains)
-- Events: 60+ (practices, matches, meetings, trips)
-- Match Details: 25+