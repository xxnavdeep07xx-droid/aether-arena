# AETHER ARENA — V1 DATABASE & NEW FEATURES SUPPLEMENT

> This file supplements your V1 Build Instructions document.
> It contains the updated database schema, RLS policies, triggers, storage buckets,
> seed data, and feature specifications for ALL features in your refined V1 scope.
>
> Append this to your V1 Build Instructions or keep it as a separate reference file.

---

## YOUR BUSINESS LOGIC (Why These Features Are In V1)

Before the technical stuff, here's WHY each feature exists — so the build chat understands the intent:

| Feature | Business Reason |
|---------|----------------|
| Leader Board | Competition drives retention. Players compete for ranks. More play = more tournament entries = more revenue. |
| Leagues | Gamification. Bronze → Silver → Gold → Diamond gives players a visible progression goal. Keeps them coming back. |
| Live Stream Banners | Primary revenue = content/streaming. Promoting live streams on the homepage drives viewers → subscribers → ad revenue. |
| Streaming Management | Admin (you) streams tournaments. Need to manage streams, schedule them, and track viewers from within the platform. |
| Top Players | Social proof + motivation. Seeing top players makes others want to grind and appear there. |
| Affiliate Product Carousel | Build audience for future Vantage Point store. Affiliate links = passive income NOW, audience for later. |
| Matches + Results | Without match results, leaderboard has no data. Need to track who won, their kills, placement, etc. |

---

## UPDATED DATABASE SCHEMA (V1 — All Tables)

Run these in the Supabase SQL Editor. This includes ALL tables needed for your refined V1.

```sql
-- ==========================================
-- TABLE 1: PROFILES (with League support)
-- ==========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  discord_id TEXT,
  discord_username TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  -- League System
  league TEXT DEFAULT 'bronze' CHECK (league IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'legend')),
  league_points INTEGER DEFAULT 0,
  -- Stats
  total_tournaments_played INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  total_prize_won INTEGER DEFAULT 0,  -- in paise
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 2: GAMES (including Pokemon Go)
-- ==========================================
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_url TEXT,
  banner_url TEXT,
  max_team_size INTEGER DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 3: TOURNAMENTS
-- ==========================================
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  game_id UUID REFERENCES games(id),
  cover_image_url TEXT,
  format TEXT NOT NULL CHECK (format IN ('solo', 'duo', 'squad', 'custom')),
  entry_fee INTEGER DEFAULT 0,  -- in paise
  prize_pool INTEGER DEFAULT 0,  -- in paise
  max_players INTEGER NOT NULL,
  registered_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  match_mode TEXT,
  map TEXT,
  room_id TEXT,
  room_password TEXT,
  custom_rules TEXT,
  -- Streaming (V1)
  stream_scheduled BOOLEAN DEFAULT FALSE,
  stream_platform TEXT CHECK (stream_platform IN ('youtube', 'loco', 'kick', 'other')),
  stream_url TEXT,
  stream_start_time TIMESTAMPTZ,
  stream_viewers INTEGER DEFAULT 0,
  -- Dates
  registration_start TIMESTAMPTZ DEFAULT NOW(),
  registration_end TIMESTAMPTZ,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  -- Meta
  created_by UUID REFERENCES profiles(id),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 4: TOURNAMENT REGISTRATIONS
-- ==========================================
CREATE TABLE tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'verified', 'refunded', 'failed')),
  payment_method TEXT,
  payment_reference TEXT,
  payment_screenshot_url TEXT,
  paid_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 5: MATCHES (within a tournament)
-- Needed for: leaderboard data, results tracking
-- ==========================================
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round TEXT NOT NULL,  -- round_1, semi_final, final, etc.
  match_number INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_start TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  room_id TEXT,
  room_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 6: MATCH PARTICIPANTS
-- Needed for: per-match stats that feed into leaderboard
-- ==========================================
CREATE TABLE match_participants (
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES profiles(id),
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  placement INTEGER,  -- 1st, 2nd, 3rd, etc.
  prize_won INTEGER DEFAULT 0,  -- in paise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (match_id, player_id)
);

-- ==========================================
-- TABLE 7: LEADERBOARD
-- Recalculated after each completed match/tournament
-- ==========================================
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id),
  game_id UUID REFERENCES games(id),
  total_points INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  kd_ratio FLOAT DEFAULT 0,
  avg_placement FLOAT DEFAULT 0,
  win_rate FLOAT DEFAULT 0,
  period TEXT DEFAULT 'all_time' CHECK (period IN ('all_time', 'monthly', 'weekly', 'daily')),
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, game_id, period)
);

-- ==========================================
-- TABLE 8: NOTIFICATIONS
-- ==========================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tournament', 'match', 'payment', 'system', 'stream', 'league')),
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 9: ANNOUNCEMENTS
-- ==========================================
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'urgent', 'celebration')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ==========================================
-- TABLE 10: STREAM SCHEDULES (V1 Simplified)
-- For managing and promoting live streams
-- ==========================================
CREATE TABLE stream_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tournament_id UUID REFERENCES tournaments(id),
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'loco', 'kick', 'other')),
  stream_url TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  peak_viewers INTEGER DEFAULT 0,
  avg_viewers INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,  -- Show on homepage banner
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 11: AFFILIATE LINKS (Product Carousel)
-- For the rotating product section on homepage
-- ==========================================
CREATE TABLE affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('amazon', 'flipkart', 'codashop', 'gamivo', 'other')),
  url TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,  -- gaming_gear, game_topup, accessories, etc.
  image_url TEXT,
  price TEXT,  -- display price, e.g. "₹1,299"
  original_price TEXT,  -- for showing discounts, e.g. "₹2,499"
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- TABLE 12: PLATFORM SETTINGS (Admin config)
-- Key-value store for platform-wide settings
-- ==========================================
CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);
```

---

## ROW LEVEL SECURITY (V1 — All Tables)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- === PROFILES ===
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- === GAMES ===
CREATE POLICY "Games viewable by all" ON games FOR SELECT USING (true);

-- === TOURNAMENTS ===
CREATE POLICY "Tournaments viewable by all" ON tournaments FOR SELECT USING (true);

-- === REGISTRATIONS ===
CREATE POLICY "Read own registrations" ON tournament_registrations FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "Create own registration" ON tournament_registrations FOR INSERT WITH CHECK (auth.uid() = player_id);

-- === MATCHES ===
CREATE POLICY "Matches viewable by all" ON matches FOR SELECT USING (true);

-- === MATCH PARTICIPANTS ===
CREATE POLICY "Match participants viewable by all" ON match_participants FOR SELECT USING (true);

-- === LEADERBOARD ===
CREATE POLICY "Leaderboard viewable by all" ON leaderboard FOR SELECT USING (true);

-- === NOTIFICATIONS ===
CREATE POLICY "Read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- === ANNOUNCEMENTS ===
CREATE POLICY "Active announcements viewable" ON announcements FOR SELECT USING (is_active = true);

-- === STREAM SCHEDULES ===
CREATE POLICY "Stream schedules viewable by all" ON stream_schedules FOR SELECT USING (true);

-- === AFFILIATE LINKS ===
CREATE POLICY "Active affiliate links viewable" ON affiliate_links FOR SELECT USING (is_active = true);

-- === PLATFORM SETTINGS ===
CREATE POLICY "Platform settings viewable by all" ON platform_settings FOR SELECT USING (true);
```

**NOTE:** Admin write policies (INSERT/UPDATE/DELETE on tournaments, matches, leaderboard, etc.) are handled SERVER-SIDE via API routes that check `is_admin`. These are NOT exposed via RLS because the admin panel uses server-side rendering or protected API routes, not direct Supabase client mutations from the browser.

---

## DATABASE TRIGGERS

```sql
-- === AUTO-UPDATE updated_at ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER leaderboard_updated_at BEFORE UPDATE ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- === AUTO-UPDATE registered_players COUNT ===
CREATE OR REPLACE FUNCTION update_tournament_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tournaments SET registered_players = registered_players + 1 WHERE id = NEW.tournament_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tournaments SET registered_players = GREATEST(0, registered_players - 1) WHERE id = OLD.tournament_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tournament_registration_count AFTER INSERT OR DELETE ON tournament_registrations FOR EACH ROW EXECUTE FUNCTION update_tournament_registration_count();

-- === AUTO-CREATE PROFILE ON SIGNUP ===
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, is_admin)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    CASE WHEN NOT EXISTS (SELECT 1 FROM profiles) THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## SUPABASE STORAGE BUCKETS

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('tournament-covers', 'tournament-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('stream-thumbnails', 'stream-thumbnails', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('affiliate-images', 'affiliate-images', true);

-- Storage policies
CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'tournament-covers');
CREATE POLICY "Auth upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'tournament-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Auth upload screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');

CREATE POLICY "Public read stream thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'stream-thumbnails');
CREATE POLICY "Auth upload stream thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stream-thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Public read affiliate images" ON storage.objects FOR SELECT USING (bucket_id = 'affiliate-images');
CREATE POLICY "Auth upload affiliate images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'affiliate-images' AND auth.role() = 'authenticated');
```

---

## SEED DATA

```sql
-- === GAMES (5 games) ===
INSERT INTO games (name, slug, max_team_size, description, sort_order) VALUES
('Free Fire', 'free-fire', 1, 'Garena Free Fire - Battle Royale', 1),
('BGMI', 'bgmi', 4, 'Battlegrounds Mobile India', 2),
('Call of Duty Mobile', 'cod-mobile', 4, 'COD Mobile - Multiplayer & Battle Royale', 3),
('Minecraft', 'minecraft', 4, 'Minecraft - Multiplayer', 4),
('Pokemon Go', 'pokemon-go', 1, 'Pokemon Go - Mobile AR Game', 5);

-- === LEAGUE THRESHOLDS (stored in platform_settings) ===
-- Admin can adjust these anytime
INSERT INTO platform_settings (key, value) VALUES
('league_bronze_min', '0'),
('league_silver_min', '100'),
('league_gold_min', '300'),
('league_platinum_min', '600'),
('league_diamond_min', '1000'),
('league_master_min', '1500'),
('league_grandmaster_min', '2100'),
('league_legend_min', '3000'),
('league_points_per_win', '25'),
('league_points_per_kill', '2'),
('league_points_per_top5', '10'),
('upi_id', 'yourname@upi'),
('platform_name', 'Aether Arena');

-- === SAMPLE TOURNAMENTS (8 tournaments) ===
-- These will be created via Admin Panel in production, but seed for testing:

-- 1. New Year Special (FREE, Custom, Featured)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, is_featured, start_time) VALUES
('New Year Special - All Games', 'Celebrate the new year with a massive multi-game tournament event! Free entry with amazing prizes.', 
 (SELECT id FROM games WHERE slug = 'bgmi'), 'custom', 0, 25000, 200, 'registration_open', true, 
 '2026-05-01 03:03:00+05:30');

-- 2. BGMI Pro League (PAID, Squad, LIVE, Featured)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, is_featured, start_time) VALUES
('BGMI Pro League S1', 'The ultimate BGMI squad competition. Show your team skills and win big!', 
 (SELECT id FROM games WHERE slug = 'bgmi'), 'squad', 10000, 100000, 100, 'in_progress', true, 
 '2026-04-16 02:03:00+05:30');

-- 3. Free Fire Friday Frenzy (FREE, Solo, Registration Open, Featured)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, is_featured, start_time) VALUES
('Free Fire Friday Frenzy', 'Free entry Free Fire solo tournament every Friday. Quick matches, real prizes!', 
 (SELECT id FROM games WHERE slug = 'free-fire'), 'solo', 0, 5000, 50, 'registration_open', true, 
 '2026-04-18 03:03:00+05:30');

-- 4. Weekend Warrior Cup (PAID, Squad)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, start_time) VALUES
('Weekend Warrior Cup', 'Saturday squad battle. Warm up your weekend with intense BGMI action.', 
 (SELECT id FROM games WHERE slug = 'bgmi'), 'squad', 5000, 20000, 100, 'registration_open', 
 '2026-04-19 07:00:00+05:30');

-- 5. Quick Match Monday (FREE, Solo)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, start_time) VALUES
('Quick Match Monday', 'Start your week with a quick free tournament. Solo BGMI, fast rounds.', 
 (SELECT id FROM games WHERE slug = 'bgmi'), 'solo', 0, 3000, 50, 'registration_open', 
 '2026-04-18 08:00:00+05:30');

-- 6. Solo Showdown - Free Fire (PAID, Solo, Completed)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, start_time) VALUES
('Solo Showdown - Free Fire', 'The ultimate Free Fire solo challenge. Only the best survive.', 
 (SELECT id FROM games WHERE slug = 'free-fire'), 'solo', 2000, 10000, 50, 'completed', 
 '2026-04-14 06:00:00+05:30');

-- 7. Minecraft Build Battle (FREE, Solo)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, start_time) VALUES
('Minecraft Build Battle', 'Show off your creativity! Build the best structure in limited time.', 
 (SELECT id FROM games WHERE slug = 'minecraft'), 'solo', 0, 2000, 30, 'registration_open', 
 '2026-04-18 04:00:00+05:30');

-- 8. COD Mobile Clash (PAID, Duo)
INSERT INTO tournaments (title, description, game_id, format, entry_fee, prize_pool, max_players, status, start_time) VALUES
('COD Mobile Clash', 'Duo showdown in Call of Duty Mobile. Team up and dominate!', 
 (SELECT id FROM games WHERE slug = 'cod-mobile'), 'duo', 3000, 15000, 60, 'registration_open', 
 '2026-04-20 07:00:00+05:30');

-- === SAMPLE STREAM SCHEDULES (for banner rotation) ===
INSERT INTO stream_schedules (title, description, platform, stream_url, scheduled_start, scheduled_end, status, is_featured, thumbnail_url) VALUES
('BGMI Pro League S1 - Live!', 'Watch the BGMI Pro League finals live! Top squads battle for the ₹1,000 prize pool.', 'youtube', 'https://youtube.com/watch?v=example', '2026-04-16 18:00:00+05:30', '2026-04-16 21:00:00+05:30', 'live', true, NULL),
('Free Fire Friday - Preview Stream', 'Pre-tournament stream. Meet the players, learn the rules, warm up!', 'youtube', 'https://youtube.com/watch?v=example2', '2026-04-18 17:00:00+05:30', '2026-04-18 18:00:00+05:30', 'scheduled', true, NULL),
('Weekend Warrior Cup - Kickoff', 'Weekend tournament kickoff stream. Join us for the opening rounds!', 'loco', 'https://loco.gg/streamer/example', '2026-04-19 18:30:00+05:30', '2026-04-19 22:00:00+05:30', 'scheduled', false, NULL);

-- === SAMPLE AFFILIATE LINKS (for product carousel) ===
INSERT INTO affiliate_links (name, platform, url, slug, description, category, image_url, price, original_price, is_active, sort_order) VALUES
('Razer DeathAdder Essential Gaming Mouse', 'amazon', 'https://amazon.in/dp/example1', 'razer-deathadder', 'Entry-level gaming mouse with 6400 DPI optical sensor.', 'gaming_gear', NULL, '₹1,299', '₹2,499', true, 1),
('BoAt Rockerz 450 Wireless Headphone', 'amazon', 'https://amazon.in/dp/example2', 'boat-rockerz-450', 'Over-ear wireless headphone with 40mm drivers. Perfect for gaming.', 'gaming_gear', NULL, '₹1,099', '₹2,990', true, 2),
('Free Fire 1080 Diamonds Top-Up', 'codashop', 'https://www.codashop.com/in/free-fire', 'ff-diamonds-1080', 'Top up 1080 diamonds for Free Fire. Instant delivery.', 'game_topup', NULL, '₹799', '₹1,080', true, 3),
('BGMI UC 660 Top-Up', 'codashop', 'https://www.codashop.com/in/bgmi', 'bgmi-uc-660', 'Top up 660 UC for BGMI. Best price guaranteed.', 'game_topup', NULL, '₹799', '₹950', true, 4),
('RedGear MP44 Mechanical Keyboard', 'flipkart', 'https://flipkart.com/rp/example', 'redgear-mp44', 'Blue switch mechanical keyboard with RGB backlighting.', 'gaming_gear', NULL, '₹999', '₹1,999', true, 5);
```

---

## LEAGUE SYSTEM SPECIFICATION

### How Leagues Work

```
POINTS SYSTEM:
  Win a tournament:        +25 league points
  Get a kill (match):      +2 league points
  Top 5 placement:         +10 league points
  Participate in tournament: +5 league points

LEAGUE THRESHOLDS:
  Bronze:       0 points
  Silver:     100 points
  Gold:       300 points
  Platinum:   600 points
  Diamond:   1000 points
  Master:     1500 points
  Grandmaster:2100 points
  Legend:     3000 points

LEAGUE COLORS (for UI):
  Bronze:     #CD7F32
  Silver:     #C0C0C0
  Gold:       #FFD700
  Platinum:   #E5E4E2
  Diamond:    #B9F2FF
  Master:     #FF6B6B
  Grandmaster:#FF4B5C
  Legend:     #BF5AF2
```

### League Badge Display
- Profile page: Show league badge next to username (colored icon + text)
- Tournament registration list: Show small league badge next to player name
- Leaderboard: Color the rank number by league (top 3 gold/silver/bronze styling)
- Right panel "Top Players": Show league icon next to avatar

### League Calculation
After each match/tournament completion, run a server-side function:
1. Sum points from all match results for the player
2. Calculate new league based on total points
3. Update `profiles.league` and `profiles.league_points`
4. Send notification if player leveled up: "You've been promoted to GOLD league!"
5. Recalculate leaderboard entries

### League Point Calculation (SQL Function for Admin/API)
```sql
-- Calculate total league points for a player
CREATE OR REPLACE FUNCTION calculate_league_points(player_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  win_points INTEGER;
  kill_points INTEGER;
  top5_points INTEGER;
  participation_points INTEGER;
  total INTEGER;
BEGIN
  -- Points from tournament wins (1st place in match)
  SELECT COALESCE(SUM(25), 0) INTO win_points
  FROM match_participants mp
  JOIN matches m ON mp.match_id = m.id
  WHERE mp.player_id = player_uuid AND mp.placement = 1;

  -- Points from kills
  SELECT COALESCE(SUM(mp.kills * 2), 0) INTO kill_points
  FROM match_participants mp
  WHERE mp.player_id = player_uuid;

  -- Points from top 5 placements
  SELECT COALESCE(SUM(10), 0) INTO top5_points
  FROM match_participants mp
  JOIN matches m ON mp.match_id = m.id
  WHERE mp.player_id = player_uuid AND mp.placement <= 5 AND mp.placement > 0;

  -- Points from tournament participation
  SELECT COALESCE(COUNT(DISTINCT tr.tournament_id) * 5, 0) INTO participation_points
  FROM tournament_registrations tr
  WHERE tr.player_id = player_uuid AND tr.payment_status = 'verified';

  total := win_points + kill_points + top5_points + participation_points;
  RETURN total;
END;
$$ LANGUAGE plpgsql;
```

---

## LEADERBOARD FEATURE SPECIFICATION

### Page: `/leaderboard` or sidebar "Leader Board" icon

**Layout:**
- Tab bar: All Games / Free Fire / BGMI / COD Mobile / Minecraft / Pokemon Go
- Time filter: All Time / This Month / This Week / Today
- Table with columns: Rank, Player (avatar + username + league badge), Points, Wins, Matches, K/D, Win Rate

**Rules:**
- Top 3 players get special styling (Gold #FFD700, Silver #C0C0C0, Bronze #CD7F32)
- Top 3 get larger avatar + crown icon
- If player is logged in, highlight their row
- Clicking a player navigates to their profile
- Real-time updates during live tournaments

**Data Source:**
- Query from `leaderboard` table
- Filter by `game_id` and `period`
- Order by `rank` ASC
- League badge color from `profiles.league`

**Admin: Recalculate Leaderboard button**
- In admin panel, a button to trigger leaderboard recalculation
- This aggregates all match results and updates rankings
- Can be automated via cron or triggered manually

---

## LIVE STREAM BANNERS FEATURE SPECIFICATION

### Location: Home page, main content area (top, above tournament cards)

**Banner Component:**
- Auto-rotating carousel (every 5-8 seconds)
- Each banner shows: stream thumbnail, stream title, platform badge (YouTube/Loco/Kick), "LIVE NOW" or upcoming badge
- Buttons: "Watch Now" (opens stream URL) + "View Participants" (navigates to linked tournament)
- For LIVE streams: Red pulsing "LIVE" indicator + viewer count
- For scheduled streams: Countdown to start time
- Manual navigation dots + left/right arrows

**Data Source:**
- Query from `stream_schedules` table
- Filter: `is_featured = true` and `status IN ('live', 'scheduled')`
- Sort: LIVE first, then by `scheduled_start` ASC
- If no live/scheduled streams, show a placeholder: "No streams scheduled. Stay tuned!"

**Admin: Manage Streams**
- `/admin/streams` page
- Create stream: title, description, platform, URL, thumbnail upload, schedule start/end, link tournament, mark as featured
- Edit/Delete streams
- Mark stream as LIVE (updates status to 'live', shows on homepage banner)
- Mark stream as ENDED (updates status to 'ended', logs peak viewers)

---

## TOP PLAYERS FEATURE SPECIFICATION

### Location: Home page, main content area (middle section)

**Component:**
- Horizontal scrollable list (or grid) of top players
- Each player card shows: avatar (left), username, league badge (right), league name text
- Sorted by league_points DESC, limited to top 10-15
- Click card → navigates to player's public profile

**Data Source:**
- Query from `profiles` table
- Order by `league_points DESC`
- Limit 15
- If less than 5 players have points > 0, show mock data with "Be the first to rank up!" message

---

## AFFILIATE PRODUCT CAROUSEL SPECIFICATION

### Location: Home page, main content area (between Top Players and Tournaments)

**Component:**
- Auto-rotating carousel (every 8-10 seconds, slower than stream banners)
- Each product card shows: product image, name, price (in green if discounted), original price (strikethrough), "Shop Now" button
- Click "Shop Now" → opens affiliate link in new tab
- Track clicks: increment `affiliate_links.clicks` on click

**Data Source:**
- Query from `affiliate_links` table
- Filter: `is_active = true`
- Order by `sort_order ASC`
- Show 3-5 products at a time, rotate through all

**Admin: Manage Affiliate Links**
- `/admin/affiliates` page
- Create: name, platform (dropdown), URL, slug, description, category, image upload, price, original price, sort order
- Edit/Delete
- Toggle active/inactive
- View click statistics

**V1 State: "Coming Soon"**
Since Vantage Point store isn't built yet:
- Show the carousel with affiliate links (earn passive income NOW)
- Add a small banner at the bottom: "Official Aether Arena Store — Coming Soon"
- When Vantage Point launches, replace some affiliate links with your own products

---

## STREAMING MANAGEMENT (Admin) FEATURE SPECIFICATION

### Location: `/admin/streams`

**Stream Dashboard:**
- Overview cards: Total Streams, Currently Live, Scheduled This Week, Total Views This Month
- List of all streams with filters (status: all/live/scheduled/ended, platform)
- Each row: thumbnail, title, platform, status badge, date, viewer count, actions

**Create/Edit Stream Form:**
- Title (text)
- Description (textarea)
- Platform (dropdown: YouTube, Loco, Kick, Other)
- Stream URL (text input)
- Thumbnail upload (to Supabase Storage 'stream-thumbnails')
- Schedule: start datetime, end datetime
- Link to tournament (dropdown from tournaments)
- Mark as Featured (checkbox) — shows on homepage banner
- Status: Scheduled / Live / Ended

**Quick Actions:**
- "Go Live" button — sets stream status to 'live', triggers homepage banner update
- "End Stream" button — sets status to 'ended', prompts for peak viewers input
- "Create Stream from Tournament" — auto-fills title, description, tournament link

**Stream Analytics (Placeholder for V1):**
- Show cards with: "Peak Viewers", "Average Viewers", "Stream Duration"
- These are manually entered for V1 (not auto-tracked from YouTube API)
- Auto-tracking will be added in V2/V3 when YouTube API is integrated

---

## UPDATED PROJECT STRUCTURE

```
aether-arena/
  src/
    app/
      layout.tsx
      page.tsx                          # Landing page
      (auth)/
        login/page.tsx
        signup/page.tsx
        auth/callback/route.ts
      (platform)/
        layout.tsx                      # 3-panel layout
        page.tsx                        # Home dashboard
        tournaments/
          page.tsx                      # Tournament listing
          [id]/page.tsx                 # Tournament detail
        leaderboard/
          page.tsx                      # Leaderboard
        streams/
          page.tsx                      # Stream schedule / watch page
        profile/
          page.tsx                      # Own profile
          [username]/page.tsx           # Public profile
        notifications/
          page.tsx
      (admin)/
        layout.tsx                      # Admin layout (is_admin check)
        page.tsx                        # Admin dashboard
        tournaments/
          page.tsx                      # Tournament CRUD
          create/page.tsx
          [id]/edit/page.tsx
        registrations/
          page.tsx                      # Payment verification
        games/
          page.tsx                      # Game management
        streams/
          page.tsx                      # Stream management
        affiliates/
          page.tsx                      # Affiliate link management
        settings/
          page.tsx                      # Platform settings
    components/
      layout/
        LeftSidebar.tsx
        MainContent.tsx
        RightPanel.tsx
        TopBar.tsx
        MobileNav.tsx
      home/
        StreamBanner.tsx                # Auto-rotating live stream banners
        TopPlayers.tsx                  # Top players horizontal scroll
        AffiliateCarousel.tsx           # Product carousel
        FeaturedTournaments.tsx
        TournamentCard.tsx
      tournament/
        TournamentFilters.tsx
        TournamentCard.tsx
        RegistrationModal.tsx
        PaymentModal.tsx
        PrizeDistribution.tsx
        RoomDetails.tsx
      leaderboard/
        LeaderboardTable.tsx
        LeagueBadge.tsx
        LeaderboardFilters.tsx
      profile/
        ProfileCard.tsx
        ProfileStats.tsx
        EditProfileForm.tsx
        MyTournaments.tsx
      admin/
        AdminStats.tsx
        TournamentForm.tsx
        PaymentVerifyRow.tsx
        StreamForm.tsx
        AffiliateForm.tsx
      ui/                              # shadcn/ui components
      shared/
        NotificationBell.tsx
        LoadingSpinner.tsx
        EmptyState.tsx
    lib/
      supabase/
        client.ts
        server.ts
      utils.ts
      league.ts                         # League calculation helpers
    types/
      database.ts
    hooks/
      useAuth.ts
      useNotifications.ts
      useTournaments.ts
      useLeaderboard.ts
  public/
    logo.svg
    favicon.ico
  .env.local
  tailwind.config.ts
  next.config.ts
  tsconfig.json
```

---

## UPDATED V1 FEATURE SCOPE

| # | Feature | Priority | Status |
|---|---------|----------|--------|
| 1 | Auth System (Discord OAuth + Email/Password) | P0 | Pending |
| 2 | Landing Page | P0 | Pending |
| 3 | 3-Panel Layout (Sidebar + Main + Right Panel) | P0 | Pending |
| 4 | Tournament Listing Page (Browse, Filter, Search) | P0 | Pending |
| 5 | Tournament Detail Page | P0 | Pending |
| 6 | Registration Flow + UPI Payment Upload | P0 | Pending |
| 7 | Admin: Tournament CRUD | P0 | Pending |
| 8 | Admin: Payment Verification Dashboard | P0 | Pending |
| 9 | User Profile (Stats, League, My Tournaments) | P1 | Pending |
| 10 | Notification System (In-app) | P1 | Pending |
| 11 | Responsive / Mobile Design | P1 | Pending |
| 12 | Leader Board (Global + Per-Game + Time Filters) | P1 | Pending |
| 13 | League System (Points, Badges, Promotion) | P1 | Pending |
| 14 | Live Stream Banners (Auto-rotating on Homepage) | P1 | Pending |
| 15 | Top Players Section (Homepage) | P1 | Pending |
| 16 | Affiliate Product Carousel (Homepage) | P2 | Pending |
| 17 | Admin: Stream Management (Schedule, Go Live, End) | P2 | Pending |
| 18 | Admin: Affiliate Link Management | P2 | Pending |
| 19 | Admin: Platform Settings (League thresholds, UPI ID) | P2 | Pending |
| 20 | Game Seed Data (5 games) | P1 | Pending |

---

## UPDATED BUILD ORDER (Recommended)

Since you're fast, here's an optimized build order that front-loads the most impactful features:

### PHASE 1: Foundation (Days 1-3)
- Project setup, database, auth, 3-panel layout, landing page

### PHASE 2: Core Tournaments (Days 4-8)
- Tournament listing, detail page, registration, UPI payment, admin CRUD

### PHASE 3: User Features (Days 9-12)
- Profile, edit profile, notifications, matches + results entry (admin)

### PHASE 4: Competitive Features (Days 13-16)
- Leaderboard, league system, league badges, top players section

### PHASE 5: Content & Revenue (Days 17-20)
- Live stream banners, stream management (admin), affiliate carousel

### PHASE 6: Polish & Launch (Days 21-25)
- Mobile responsive, bug fixes, admin dashboard analytics, final testing, deploy

---

**END OF V1 DATABASE & NEW FEATURES SUPPLEMENT**

Keep this file alongside your V1 Build Instructions. When starting the build, tell the AI:
"I have TWO files: V1 Build Instructions (design + features) and V1 Database Supplement (schema + data). Read BOTH before starting."
