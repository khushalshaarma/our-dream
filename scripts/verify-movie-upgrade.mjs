import Database from 'better-sqlite3';
import path from 'path';

console.log('🎀 Verifying Dear Midnight Movie Upgrade...\n');

const dbPath = path.join(process.cwd(), 'data', 'midnight.db');
const db = new Database(dbPath);

let passed = 0;
let total = 0;

function check(cond, msg) {
  total++;
  if (cond) {
    console.log(`✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${msg}`);
    process.exit(1);
  }
}

// 1. Verify schema columns on movies table
const cols = db.prepare('PRAGMA table_info(movies)').all().map((c) => c.name);
const expectedCols = [
  'id',
  'title',
  'year',
  'poster_url',
  'backdrop_url',
  'overview',
  'runtime',
  'genre',
  'notes',
  'mood',
  'rating',
  'vote_count',
  'tmdb_id',
  'planned_date',
  'planned_time',
  'added_by',
  'is_watched',
  'watched_date',
];

for (const c of expectedCols) {
  check(cols.includes(c), `Column "${c}" exists in movies table`);
}

// 2. Verify existing movies are intact
const allMovies = db.prepare('SELECT * FROM movies').all();
check(allMovies.length >= 5, `All ${allMovies.length} existing movies preserved safely`);

// 3. Test Inserting Movie with Planned Watch Date & Time and TMDB details
const testMovieId = 'test-upgrade-interstellar-' + Date.now();
db.prepare(`
  INSERT INTO movies (
    id, title, year, poster_url, backdrop_url, overview, runtime,
    genre, notes, rating, planned_date, planned_time, added_by,
    is_watched, watched_date, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
`).run(
  testMovieId,
  'Interstellar',
  2014,
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
  'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
  169,
  'Adventure / Drama / Sci-Fi',
  'late night date with my favorite idiot.',
  8.7,
  '2026-11-21',
  '11:30 PM',
  'Tanushree',
  Date.now(),
  Date.now()
);

const inserted = db.prepare('SELECT * FROM movies WHERE id = ?').get(testMovieId);
check(inserted.title === 'Interstellar', 'Movie title stored correctly');
check(inserted.planned_date === '2026-11-21', 'Planned date "2026-11-21" stored');
check(inserted.planned_time === '11:30 PM', 'Planned time "11:30 PM" stored');
check(inserted.poster_url && inserted.poster_url.includes('image.tmdb.org'), 'Official TMDB poster URL stored');
check(inserted.backdrop_url && inserted.backdrop_url.includes('image.tmdb.org'), 'Widescreen TMDB backdrop URL stored');
check(inserted.runtime === 169, 'Movie runtime (169 mins) stored');
check(inserted.rating === 8.7, 'Rating (8.7) stored');

// 4. Test Ticking Heart (Mark as watched)
const watchedDate = '2026-11-21';
db.prepare('UPDATE movies SET is_watched = 1, watched_date = ? WHERE id = ?').run(watchedDate, testMovieId);
db.prepare(`
  INSERT INTO watch_sessions (id, movie_id, watched_date, watched_time, created_at)
  VALUES (?, ?, ?, ?, ?)
`).run('test-session-' + Date.now(), testMovieId, watchedDate, '11:30 PM', Date.now());

const watchedCheck = db.prepare('SELECT is_watched, watched_date FROM movies WHERE id = ?').get(testMovieId);
check(watchedCheck.is_watched === 1, 'Movie marked as watched');
check(watchedCheck.watched_date === watchedDate, 'Watched date properly stamped on movie record');

// 5. Test Unticking Heart (Mark as unwatched)
db.prepare('UPDATE movies SET is_watched = 0, watched_date = NULL WHERE id = ?').run(testMovieId);
db.prepare('DELETE FROM watch_sessions WHERE movie_id = ?').run(testMovieId);

const untickedCheck = db.prepare('SELECT is_watched, watched_date FROM movies WHERE id = ?').get(testMovieId);
check(untickedCheck.is_watched === 0, 'Movie unticked to unwatched');
check(untickedCheck.watched_date === null, 'Watched date reset to null on untick');

// 6. Test Calendar queries for both watched and planned
const calendarPlanned = db.prepare('SELECT id, title, planned_date, planned_time FROM movies WHERE planned_date IS NOT NULL').all();
check(calendarPlanned.some((m) => m.id === testMovieId), 'Planned movie query for Midnight Calendar functions correctly');

// Cleanup test movie
db.prepare('DELETE FROM movies WHERE id = ?').run(testMovieId);
const cleanupCheck = db.prepare('SELECT id FROM movies WHERE id = ?').get(testMovieId);
check(!cleanupCheck, 'Test record cleaned up cleanly');

console.log(`\n🎉 All ${passed}/${total} upgrade checks passed successfully! ♡\n`);
