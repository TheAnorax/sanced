const bcrypt = require('bcrypt');
const pool = require('./src/config/database'); // Asegúrate de que la ruta es correcta

const insertTestUser = async () => {
  const email = 'eva.bautista@santul.net';
  const password = 'EvaBautista#';
  const unidad = 'CEDIS';
  const name = 'Eva Bautista';
  const role = 'Audi';
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query('INSERT INTO usuarios (email, password, unidad, name, role) VALUES (?, ?, ?, ?, ? )', [email, hashedPassword, unidad, name, role]);
  console.log('Test user inserted');
};

insertTestUser().catch((error) => {
  console.error('Error inserting test user:', error);
});

//  Email: gerardo.rodriguez@santul.net
//  Password: GerardoRodriguez#
// <>