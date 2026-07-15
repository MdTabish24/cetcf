const bcrypt = require('bcrypt');
const db = require('./db');

async function updateAdmin() {
  const newEmail = 'info.cetcf@gmail.com';
  const newPassword = 'ShoebMomin_cetcf01@421302';

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Check if there are any admins at all
    const res = await db.query('SELECT * FROM admins');
    
    if (res.rows.length === 0) {
      await db.query(
        'INSERT INTO admins (email, password_hash, name) VALUES ($1, $2, $3)',
        [newEmail, hashedPassword, 'CETC Admin']
      );
      console.log('Inserted new admin record.');
    } else {
      // Just update the first admin
      const adminId = res.rows[0].id;
      await db.query(
        'UPDATE admins SET email = $1, password_hash = $2 WHERE id = $3',
        [newEmail, hashedPassword, adminId]
      );
      console.log('Updated existing admin record.');
    }
    
    console.log(`Successfully updated admin credentials!`);
    console.log(`ID: ${newEmail}`);
    console.log(`Password: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating admin:', err);
    process.exit(1);
  }
}

updateAdmin();
