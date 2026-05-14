import jwt from 'jsonwebtoken';
import 'dotenv/config'; // Esto jala el JWT_SECRET de tu archivo .env

// 1. Aquí configuramos qué datos va a llevar tu token por dentro
const payload = {
  id: 'tavBUbqU6qRXiTF5biSf', 
  role: 'patient' 
};

// 2. Firmamos el token con el secreto de tu .env
const secret = process.env.JWT_SECRET;
const token = jwt.sign(payload, secret, { expiresIn: '365d' });

// 3. Lo imprimimos en la consola para que lo puedas copiar
console.log('\n=== COPIA ESTE TOKEN PARA POSTMAN ===\n');
console.log(token);
console.log('\n=====================================\n');