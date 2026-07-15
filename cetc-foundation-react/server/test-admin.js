const bcrypt = require('bcrypt');
const db = require('./db');

async function testAdmin() {
  const emailToTest = 'info.cetcf@gmail.com';
  const passwordToTest = 'ShoebMomin_cetcf01@421302';

  try {
    const result = await db.query('SELECT * FROM admins WHERE email = $1', [emailToTest]);
    if (result.rows.length === 0) {
      console.log('Admin not found in DB with that email.');
      process.exit(1);
    }
    const admin = result.rows[0];
    console.log('Admin found:', { id: admin.id, email: admin.email, is_active: admin.is_active });

    const isMatch = await bcrypt.compare(passwordToTest, admin.password_hash);
    console.log('Password match:', isMatch);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
testAdmin();
