// controllers/authController.js
const { getUserByEmail, comparePassword, generateToken } = require('../services/userService');

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Received email:', email);  // Agregar esto
  console.log('Received password:', password);  // Agregar esto

  try {
    const user = await getUserByEmail(email);
    console.log('Found user:', user);  // Agregar esto
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password);
    console.log('Password match:', isMatch);  // Agregar esto
    if (!isMatch) {
      console.log('Password does not match'); 
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    console.log('Generated token:', token);  // Agregar esto
    res.json({ token, user });
  } catch (error) {
    console.log('Error during login:', error);  // Agregar esto
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login };
