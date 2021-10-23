import { Router } from 'express';
import itemsRouter from './items.routes';
import locationsRouter from './location.routes';
import usersRouter from './users.routes';
import sessionRouter from './sessions.routes';

const routes = Router();

routes.use('/items', itemsRouter);
routes.use('/locations', locationsRouter);
routes.use('/users', usersRouter);
routes.use('/sessions', sessionRouter);

export default routes;
