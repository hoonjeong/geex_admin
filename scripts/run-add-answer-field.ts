import pool from '../lib/db';

async function addAnswerField() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Adding answer field to class_content table...');
    
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
    console.log('Database update completed successfully!');
    
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Answer field already exists in the table.');
    } else {
      console.error('Error updating database:', error);
      throw error;
    }
  } finally {
    connection.release();
    process.exit(0);
  }
}

addAnswerField().catch(console.error);