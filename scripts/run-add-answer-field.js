const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function addAnswerField() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  
  try {
    console.log('Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    console.log('\nAdding answer field to class_content table...');
    
    // answer 필드 추가
    await connection.query(`
      ALTER TABLE class_content 
      ADD COLUMN answer TEXT AFTER content
    `);
    
    console.log('Answer field added successfully!');
    
    // 기존 데이터에 기본값 설정
    await connection.query(`
      UPDATE class_content 
      SET answer = '' 
      WHERE answer IS NULL
    `);
    
    console.log('Default values set for existing records.');
    console.log('\n✅ Database update completed successfully!');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✓ Answer field already exists in the table.');
    } else {
      console.error('Error updating database:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
    process.exit(0);
  }
}

addAnswerField().catch(console.error);