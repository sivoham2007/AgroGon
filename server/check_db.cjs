const db = require('./src/db.js').db;
console.log(db.prepare("SELECT sql FROM sqlite_master WHERE name='soil_tests'").get());
