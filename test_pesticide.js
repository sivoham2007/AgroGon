import { db } from './server/src/db.js';
import { v4 as uuidv4 } from 'uuid';

try {
  // get a farmer_id
  const farmer = db.prepare('SELECT id FROM farmers LIMIT 1').get();
  if (!farmer) throw new Error('No farmer');
  
  const id = uuidv4();
  const insertStmt = db.prepare(`
      INSERT INTO pesticide_calculations (id, farmer_id, farm_id, crop, pest, product, area_acres, tank_capacity, water_req, num_tanks, product_per_tank, total_product)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  insertStmt.run(id, farmer.id, null, 'Tomato', 'Stem Borer', 'Product X', 2.7, 16, 540, 34, 4.76, 162);
  console.log('Success pesticide');

  // test fertilizer
  const fertId = uuidv4();
  const fertStmt = db.prepare(`
      INSERT INTO fertilizer_plans (id, farmer_id, farm_id, crop, area_acres, soil_type, n_req, p_req, k_req, recommendation_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  fertStmt.run(fertId, farmer.id, null, 'Tomato', 2.7, 'Loamy', 50, 25, 25, JSON.stringify({}));
  console.log('Success fertilizer');

} catch(e) {
  console.error(e);
}
