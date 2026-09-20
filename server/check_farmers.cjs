const db = require('./src/db.js').db;
console.log("Farmers:", db.prepare("SELECT * FROM farmers").all());
