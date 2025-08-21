import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS geex`);
    console.log('Database created or already exists');

    await connection.query(`USE geex`);

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status_code VARCHAR(20) DEFAULT 'active',
        permission_code VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTableQuery);
    console.log('Table admin_user created or already exists');

    // Create test_info table
    const createTestInfoTable = `
      CREATE TABLE IF NOT EXISTS test_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        year INT NOT NULL,
        month INT NOT NULL CHECK (month >= 1 AND month <= 12),
        grade INT NOT NULL CHECK (grade >= 1 AND grade <= 3),
        info TEXT,
        UNIQUE KEY unique_test (year, month, grade),
        INDEX idx_year_month_grade (year, month, grade)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTestInfoTable);
    console.log('Table test_info created or already exists');

    // Create class_content table
    const createClassContentTable = `
      CREATE TABLE IF NOT EXISTS class_content (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content LONGTEXT NOT NULL,
        question_num INT NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        test_id INT NOT NULL,
        insert_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_test_id (test_id),
        INDEX idx_question_num (question_num),
        FOREIGN KEY (test_id) REFERENCES test_info(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createClassContentTable);
    console.log('Table class_content created or already exists');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initDatabase();