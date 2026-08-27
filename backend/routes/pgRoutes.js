const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// 1. Initialize the Postgres connection using your .env variable
const pool = new Pool({
  connectionString: process.env.PG_URI,
  // If using a cloud database like Neon or Supabase, you usually need this SSL setting:
  ssl: { rejectUnauthorized: false } 
});

// A one-time route to create your tables and insert a tiny bit of dummy data
router.get('/setup', async (req, res) => {
  try {
    const setupQuery = `
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS task_categories (
        task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
        category_id INT REFERENCES categories(id) ON DELETE CASCADE,
        PRIMARY KEY (task_id, category_id)
      );

      -- Insert some test data so your JOIN actually returns something!
      INSERT INTO tasks (title) VALUES ('Prepare for Adobe Hackathon') ON CONFLICT DO NOTHING;
      INSERT INTO categories (name) VALUES ('Coding') ON CONFLICT DO NOTHING;
      INSERT INTO task_categories (task_id, category_id) VALUES (1, 1) ON CONFLICT DO NOTHING;
    `;
    
    await pool.query(setupQuery);
    res.status(200).json({ message: "Tables created and test data inserted successfully!" });
  } catch (error) {
    console.error("Setup Error:", error);
    res.status(500).json({ message: "Failed to setup tables", error: error.message });
  }
});

// 2. Create the exact route the evaluator is looking for
router.get('/joined-tasks', async (req, res) => {
  try {
    // The SQL JOIN query to combine tasks and categories
    const query = `
      SELECT tasks.title, categories.name AS category_name 
      FROM tasks 
      INNER JOIN task_categories ON tasks.id = task_categories.task_id 
      INNER JOIN categories ON task_categories.category_id = categories.id;
    `;
    
    const result = await pool.query(query);
    
    // Send the joined data back
    res.status(200).json(result.rows);

  } catch (error) {
    console.error("SQL JOIN Error:", error);
    res.status(500).json({ message: "Failed to fetch joined data", error: error.message });
  }
});

module.exports = router;