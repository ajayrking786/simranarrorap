// Pure JavaScript Database Layer (Firestore & Serverless Compatible)
// No native SQLite / C++ binary dependencies for 100% Netlify & Cloud compatibility.
const { store, db, initDb, ensureAdminFromEnv } = require('./data-store');

module.exports = {
  store,
  db,
  initDb,
  ensureAdminFromEnv
};
