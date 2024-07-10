const bcrypt = require('bcrypt');
const pool = require('./src/config/database'); // Asegúrate de que la ruta es correcta

const insertTestUser = async () => {
  const email = 'juan.cuamatla@santul.net';
  const password = 'Juan#';
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query('INSERT INTO usuarios (email, password) VALUES (?, ?)', [email, hashedPassword]);
  console.log('Test user inserted');
};

insertTestUser().catch((error) => {
  console.error('Error inserting test user:', error);
});
