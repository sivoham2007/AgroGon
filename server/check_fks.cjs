const db = require('./src/db.js').db;
console.log("Farmers:", db.prepare("SELECT id FROM farmers").all());
console.log("Farms:", db.prepare("SELECT id, farmer_id FROM farms").all());
