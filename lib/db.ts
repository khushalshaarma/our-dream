import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
const uploadsDir = path.join(dataDir, 'uploads');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'midnight.db');

// Add timeout to prevent SQLITE_BUSY during Next.js parallel build workers
const db = new Database(dbPath, { timeout: 15000 });

try {
  db.pragma('busy_timeout = 15000');
  db.pragma('journal_mode = WAL');
} catch {
  // Ignore if already set
}

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_name TEXT,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER,
    poster_url TEXT,
    genre TEXT,
    notes TEXT,
    mood TEXT,
    added_by TEXT DEFAULT 'Tanushree',
    is_watched INTEGER DEFAULT 0,
    watched_date TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS watch_sessions (
    id TEXT PRIMARY KEY,
    movie_id TEXT NOT NULL,
    watched_date TEXT NOT NULL,
    watched_time TEXT,
    tanushree_rating REAL,
    khushal_rating REAL,
    review TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(movie_id) REFERENCES movies(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS polaroids (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    caption TEXT,
    date_taken TEXT,
    movie_id TEXT,
    uploaded_by TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS achievements (
    key TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    unlocked_at INTEGER
  );
`);

// Pre-seed default settings
const defaultSettings: Record<string, string> = {
  anniversary_date: '2026-08-08',
  timezone: 'Asia/Kolkata',
  sound_enabled: '0',
  custom_tagline: 'same two idiots. different movie. every night.',
};

const insertSetting = db.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
for (const [k, v] of Object.entries(defaultSettings)) {
  insertSetting.run(k, v);
}

// Pre-seed achievements
const defaultAchievements = [
  { key: 'first_movie', title: 'first date with the credits', description: 'Watched your very first movie together on oops, midnight!', icon: '🎬' },
  { key: 'couch_potatoes', title: 'certified couch potatoes', description: 'Surviving 10 cinematic midnight sessions together.', icon: '🛋️' },
  { key: 'night_owls', title: 'professional night owls', description: '5 movie nights started well past midnight.', icon: '🦉' },
  { key: 'cinematic_soulmates', title: 'cinematic soulmates', description: 'Reached a magical milestone of 25 watched films.', icon: '✨' },
];

const insertAchievement = db.prepare('INSERT OR IGNORE INTO achievements (key, title, description, icon) VALUES (?, ?, ?, ?)');
for (const ach of defaultAchievements) {
  insertAchievement.run(ach.key, ach.title, ach.description, ach.icon);
}

// Safe non-destructive column migrations for movies table
const addColumnIfNotExists = (table: string, column: string, type: string) => {
  try {
    const cols = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
    if (!cols.some((c) => c.name === column)) {
      db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`).run();
    }
  } catch {
    // Ignore migration error if column exists
  }
};

addColumnIfNotExists('movies', 'backdrop_url', 'TEXT');
addColumnIfNotExists('movies', 'overview', 'TEXT');
addColumnIfNotExists('movies', 'runtime', 'INTEGER');
addColumnIfNotExists('movies', 'tmdb_id', 'TEXT');
addColumnIfNotExists('movies', 'rating', 'REAL');
addColumnIfNotExists('movies', 'vote_count', 'INTEGER');
addColumnIfNotExists('movies', 'planned_date', 'TEXT');
addColumnIfNotExists('movies', 'planned_time', 'TEXT');

// Sync existing watch_sessions to movies.watched_date if missing
try {
  db.exec(`
    UPDATE movies
    SET watched_date = (
      SELECT watched_date FROM watch_sessions
      WHERE watch_sessions.movie_id = movies.id
      ORDER BY created_at DESC LIMIT 1
    )
    WHERE is_watched = 1 AND (watched_date IS NULL OR watched_date = '');
  `);
} catch {
  // Ignore if watch_sessions is empty
}

// Pre-seed starter movies if table is empty
const countMovies = (db.prepare('SELECT COUNT(*) as count FROM movies').get() as any).count;
if (countMovies === 0) {
  const starters = [
    {
      id: 'movie-about-time',
      title: 'About Time',
      year: 2013,
      poster_url: 'https://image.tmdb.org/t/p/w500/iR1bVfURbNjnUsAU7eV2HGZcxzP.jpg',
      genre: 'Romance / Drama',
      notes: 'Prepare tissues. The beach walk scene will break us in the best way.',
      mood: 'emotionally devastating',
      added_by: 'Tanushree',
      is_watched: 0,
      watched_date: null,
    },
    {
      id: 'movie-before-sunrise',
      title: 'Before Sunrise',
      year: 1995,
      poster_url: 'https://image.tmdb.org/t/p/w500/kf1Jb1RC6REwye1yk4iVsH654Nf.jpg',
      genre: 'Romance / Drama',
      notes: 'Our exact late night conversational yap-to-movie ratio.',
      mood: 'silly little romance',
      added_by: 'Khushal',
      is_watched: 0,
      watched_date: null,
    },
    {
      id: 'movie-la-la-land',
      title: 'La La Land',
      year: 2016,
      poster_url: 'https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkVJt0Rf0.jpg',
      genre: 'Romance / Musical',
      notes: 'City of stars... are you shining just for us?',
      mood: 'comfort watch',
      added_by: 'Tanushree',
      is_watched: 0,
      watched_date: null,
    },
    {
      id: 'movie-spirited-away',
      title: 'Spirited Away',
      year: 2001,
      poster_url: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
      genre: 'Animation / Ghibli',
      notes: 'Rainy midnight Ghibli marathon staple with hot strawberry milk.',
      mood: 'cozy rainy night',
      added_by: 'Khushal',
      is_watched: 0,
      watched_date: null,
    },
    {
      id: 'movie-your-name',
      title: 'Your Name.',
      year: 2016,
      poster_url: 'https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6qFsPwaF6l24.jpg',
      genre: 'Animation / Romance',
      notes: 'The spark animation and soundtrack will alter our brain chemistry forever.',
      mood: 'plot twist victims',
      added_by: 'Tanushree',
      is_watched: 0,
      watched_date: null,
    },
  ];

  const insertMovie = db.prepare(`
    INSERT INTO movies (id, title, year, poster_url, genre, notes, mood, added_by, is_watched, watched_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  for (const m of starters) {
    insertMovie.run(
      m.id,
      m.title,
      m.year,
      m.poster_url,
      m.genre,
      m.notes,
      m.mood,
      m.added_by,
      m.is_watched,
      m.watched_date,
      now,
      now
    );
  }
}

export { db, dataDir, uploadsDir };
