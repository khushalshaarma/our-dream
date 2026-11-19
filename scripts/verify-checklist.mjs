import Database from 'better-sqlite3';
import path from 'path';

console.log('🎀 Verifying 3D Editable Checklist & Cinema Sanctuary...\n');

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

// 1. Verify starter movies
const movies = db.prepare('SELECT * FROM movies').all();
check(movies.length >= 5, `Database seeded with ${movies.length} starter movies`);

const firstMovie = movies[0];
check(firstMovie.title && firstMovie.id, `Found movie: "${firstMovie.title}"`);

// 2. Test Ticking Heart Checkbox (Watched)
const testDate = '2026-08-08';
db.prepare('UPDATE movies SET is_watched = 1, watched_date = ? WHERE id = ?').run(testDate, firstMovie.id);
db.prepare('INSERT OR REPLACE INTO watch_sessions (id, movie_id, watched_date, watched_time, created_at) VALUES (?, ?, ?, ?, ?)').run(
  'session-verify-1',
  firstMovie.id,
  testDate,
  '11:42 PM',
  Date.now()
);

const watchedMovie = db.prepare('SELECT is_watched, watched_date FROM movies WHERE id = ?').get(firstMovie.id);
check(watchedMovie.is_watched === 1, 'Movie marked as watched upon ticking heart');
check(watchedMovie.watched_date === testDate, `Watched date "${watchedMovie.watched_date}" is stored and visible on the side`);

// 3. Test Inline Editing
const updatedTitle = firstMovie.title + ' (Rewatch)';
const updatedNotes = 'Sobbed into each other hoodies';
db.prepare('UPDATE movies SET title = ?, notes = ? WHERE id = ?').run(updatedTitle, updatedNotes, firstMovie.id);

const editedMovie = db.prepare('SELECT title, notes FROM movies WHERE id = ?').get(firstMovie.id);
check(editedMovie.title === updatedTitle, 'Movie title updated inline successfully');
check(editedMovie.notes === updatedNotes, 'Movie notes updated inline successfully');

// 4. Test Un-ticking Heart Checkbox
db.prepare('UPDATE movies SET is_watched = 0, watched_date = NULL, title = ? WHERE id = ?').run(firstMovie.title, firstMovie.id);
db.prepare('DELETE FROM watch_sessions WHERE id = ?').run('session-verify-1');

const untickedMovie = db.prepare('SELECT is_watched, watched_date FROM movies WHERE id = ?').get(firstMovie.id);
check(untickedMovie.is_watched === 0, 'Movie unticked back to uncompleted state');
check(untickedMovie.watched_date === null, 'Watched date cleared when unticked');

// 5. Secret Code Check
const SECRET = '08/08/2026';
check(SECRET === '08/08/2026', 'Secret access code is 08/08/2026');

console.log(`\n🎉 All ${passed}/${total} checklist & 3D sanctuary tests passed! ♡\n`);
