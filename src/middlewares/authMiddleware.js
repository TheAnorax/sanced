// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid Token' });
    }

    // Log para ver el payload decodificado
    console.log('Decoded JWT Payload:', decoded);

    // Verificar que id_usu está presente en el token
    const userId = decoded.id_usu;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // Almacenar el id_usu en res.locals para acceso global
    res.locals.userId = userId;
    console.log("Middleware user ID:", res.locals.userId);

    next();
  });
};

module.exports = authenticateToken;
