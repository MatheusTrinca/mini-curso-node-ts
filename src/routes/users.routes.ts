import { Router } from 'express';
import knex from '../database/connection';
import { celebrate, Joi } from 'celebrate';
import { hash } from 'bcryptjs';

const usersRouter = Router();

usersRouter.get('/', async (req, res) => {
  const users = await knex('users').select('*');
  return res.json(users);
});

usersRouter.post(
  '/',
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
      }),
    },
    { abortEarly: false }
  ),
  async (req, res) => {
    const { name, email, password } = req.body;

    const user = await knex('users').where('email', email).first();
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const passwordHashed = await hash(password, 8);
    const newUser = { name, email, password: passwordHashed };
    const newIds = await knex('users').insert(newUser);
    return res.json({
      id: newIds[0],
      ...newUser,
    });
  }
);

export default usersRouter;
