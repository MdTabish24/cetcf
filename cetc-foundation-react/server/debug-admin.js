const bcrypt = require('bcrypt');
const db = require('./db');

async function debugAdmin() {
  const emailToTest = 'info.cetcf@gmail.com';
  const passwordToTest = 'ShoebMomin_cetcf01@421302';

  try {
    const result = await db.query('SELECT * FROM admins WHERE email = $1', [emailToTest]);
    if (result.rows.length === 0) {
      console.log('❌ Admin not found in DB with that email.');
      process.exit(1);
    }
    const admin = result.rows[0];
    console.log('✅ Admin found in DB:', { id: admin.id, email: admin.email, is_active: admin.is_active });

    if (!admin.is_active) {
       console.log('❌ Admin is NOT active. Fixing it now...');
       await db.query('UPDATE admins SET is_active = true WHERE id = $1', [admin.id]);
       console.log('✅ Admin is now active.');
    }

    const isMatch = await bcrypt.compare(passwordToTest, admin.password_hash);
    if (isMatch) {
       console.log('✅ Password matches perfectly.');
    } else {
       console.log('❌ Password DOES NOT match.');
       // Re-hash and update
       console.log('Fixing password...');
       const newHash = await bcrypt.hash(passwordToTest, 10);
       await db.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newHash, admin.id]);
       console.log('✅ Password fixed.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
debugAdmin();
