import { Router } from 'express';
import knex from '../database/connection';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';

const sessionRouter = Router();

sessionRouter.post('/', async (req, res) => {
  const { email, password } = req.body;

  const user = await knex('users').where('email', email).first();
  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const passwordMatched = await compare(password, user.password);
  if (!passwordMatched) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({}, authConfig.jwt.secret, {
    subject: String(user.id),
    expiresIn: authConfig.jwt.expiresIn,
  });

  return res.json({ user, token });
});

export default sessionRouter;
