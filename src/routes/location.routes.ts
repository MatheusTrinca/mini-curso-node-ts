import { Router } from 'express';
import knex from '../database/connection';

const locationsRouter = Router();

locationsRouter.post('/', async (req, res) => {
  const { name, email, whatsapp, latitude, longitude, city, uf, items } =
    req.body;

  const location = {
    image: 'fake-image.png',
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf,
  };

  const newIds = await knex('locations').insert(location);

  const locationId = newIds[0];

  const newLocationsItems = items.map((itemId: number) => {
    return {
      location_id: locationId,
      item_id: itemId,
    };
  });

  await knex('locations_items').insert(newLocationsItems);

  return res.json({
    id: locationId,
    ...location,
  });
});

export default locationsRouter;
