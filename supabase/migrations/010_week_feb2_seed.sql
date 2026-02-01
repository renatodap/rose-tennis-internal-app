-- Week of Feb 2-8: Replace generic events with Coach Wilson's actual schedule
-- Source: Coach Wilson's team messages

-- =====================================================
-- 1. DELETE generic Feb 2-5 events from 002_seed
-- =====================================================
DELETE FROM events WHERE event_date = '2026-02-02' AND title = 'Practice' AND event_type = 'practice';
DELETE FROM events WHERE event_date = '2026-02-03' AND title = 'SRC Fitness' AND event_type = 'fitness';
DELETE FROM events WHERE event_date = '2026-02-04' AND title = 'Practice' AND event_type = 'practice';
DELETE FROM events WHERE event_date = '2026-02-05' AND title = 'SRC Fitness' AND event_type = 'fitness' AND for_womens = true AND for_mens = false;
DELETE FROM events WHERE event_date = '2026-02-05' AND title = 'Bubble Practice' AND event_type = 'practice' AND for_mens = true AND for_womens = false;

-- =====================================================
-- 2. UPDATE existing match notes
-- =====================================================
UPDATE events SET notes = 'Leave at 11:30am. Played at Wabash College'
WHERE event_date = '2026-02-06' AND title = 'vs Case Western Reserve';

UPDATE events SET notes = 'Leave late morning'
WHERE event_date = '2026-02-07' AND title = '@ IU Kokomo';

-- =====================================================
-- 3. INSERT new events - WOMEN'S TEAM
-- =====================================================

-- Mon 2/2: Women - Practice 3 Courts
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Practice - 3 Courts', 'practice', '2026-02-02', '17:00', '19:00', 'Bubble', false, true, NULL);

-- Tue 2/3: Women - Match @ DePauw
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ DePauw', 'match', '2026-02-03', '15:00', 'Greencastle, IN', false, true, 'Leave at 3pm');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'DePauw', 'away' FROM events WHERE event_date = '2026-02-03' AND title = '@ DePauw';

-- Wed 2/4: Women - Yoga
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Yoga', 'fitness', '2026-02-04', '17:00', '18:00', 'MPR', false, true, 'On campus');

-- Thu 2/5: Women - Practice Split Group
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Practice - Split Group (1 court)', 'practice', '2026-02-05', '17:00', '19:00', 'Bubble', false, true, 'Team organizes 5-6 and 6-7 splits');

-- Fri 2/6: Women - Match Prep 3 Courts
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Match Prep - 3 Courts', 'practice', '2026-02-06', '17:00', '19:00', 'Bubble', false, true, NULL);

-- =====================================================
-- 4. INSERT new events - MEN'S TEAM
-- =====================================================

-- Mon 2/2: Men - Practice Split Group
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Practice - Split Group (1 court)', 'practice', '2026-02-02', '17:00', '19:00', 'Bubble', true, false, 'Team organizes 5-6 and 6-7 splits');

-- Tue 2/3: Men - Watch Women's Match
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('Watch Women''s Match', 'other', '2026-02-03', NULL, NULL, true, false, 'Support the women at DePauw');

-- Wed 2/4: Men - Practice 2 Courts
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Practice - 2 Courts', 'practice', '2026-02-04', '17:00', '19:00', 'Bubble', true, false, NULL);

-- Thu 2/5: Men - Practice 3 Courts
INSERT INTO events (title, event_type, event_date, start_time, end_time, location, for_mens, for_womens, notes)
VALUES ('Practice - 3 Courts', 'practice', '2026-02-05', '17:00', '19:00', 'Bubble', true, false, NULL);

-- Sat 2/7: Men - Recovery Day
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('Recovery Day', 'other', '2026-02-07', NULL, NULL, true, false, 'Optional: watch women vs IU Kokomo');

-- Sun 2/8: Men - Match @ DePauw
INSERT INTO events (title, event_type, event_date, start_time, location, for_mens, for_womens, notes)
VALUES ('@ DePauw', 'match', '2026-02-08', '12:00', 'Greencastle, IN', true, false, 'Leave at Noon');
INSERT INTO match_details (event_id, opponent, home_away)
SELECT id, 'DePauw', 'away' FROM events WHERE event_date = '2026-02-08' AND title = '@ DePauw';

-- =====================================================
-- 5. ANNOUNCEMENT
-- =====================================================
INSERT INTO announcements (title, content, priority, for_mens, for_womens, expires_at)
VALUES (
  'Week of Feb 2 - The Journey Starts Here!',
  E'Big week ahead for both teams!\n\nWOMEN''S SCHEDULE:\n- Mon: Practice (3 courts, 5-7pm, Bubble)\n- Tue: Match @ DePauw (leave at 3pm)\n- Wed: Yoga (5-6pm, MPR)\n- Thu: Split group practice (1 court, organize 5-6 & 6-7 splits)\n- Fri: Match prep (3 courts, 5-7pm, Bubble)\n- Sat: Match @ IU Kokomo (leave late morning)\n\nMEN''S SCHEDULE:\n- Mon: Split group practice (1 court, organize 5-6 & 6-7 splits)\n- Tue: Support the women at DePauw\n- Wed: Practice (2 courts, 5-7pm, Bubble)\n- Thu: Practice (3 courts, 5-7pm, Bubble)\n- Fri: Match vs Case Western (leave at 11:30am)\n- Sat: Recovery day\n- Sun: Match @ DePauw (leave at Noon)\n\nSplit court days: Captains will organize who goes 5-6pm and 6-7pm. Communicate with your team!',
  'high',
  true,
  true,
  '2026-02-09T23:59:59Z'
);
