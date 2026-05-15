import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};