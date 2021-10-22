import { Router } from 'express';
import knex from '../database/connection';
import multer from 'multer';
import multerConfig from '../config/multer';

const locationsRouter = Router();

const upload = multer(multerConfig);

locationsRouter.get('/', async (req, res) => {
  const { city, uf, items } = req.query;

  const parsedItems: number[] = String(items)
    .split(',')
    .map(item => Number(item.trim()));

  const locations = await knex('locations')
    .join('locations_items', 'locations.id', '=', 'locations_items.location_id')
    .distinct()
    .select('locations.*')
    .modify(function (queryBuilder) {
      if (items) {
        queryBuilder.whereIn('locations_items.item_id', parsedItems);
      }
      if (city) {
        queryBuilder.where('city', String(city));
      }
      if (uf) {
        queryBuilder.where('uf', String(uf));
      }
    });
  return res.json(locations);
});

locationsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const location = await knex('locations').where('id', id).first();

  if (!location) {
    return res.status(400).json({ message: 'Location not found' });
  }

  const items = await knex('items')
    .join('locations_items', 'items.id', '=', 'locations_items.item_id')
    .where('locations_items.location_id', id)
    .select('items.title');

  return res.json({ location, items });
});

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

  const transaction = await knex.transaction();

  const newIds = await transaction('locations').insert(location);

  const location_id = newIds[0];

  const newLocationsItems = items.map(async (item_id: number) => {
    const item = await transaction('items').where('id', item_id).first();
    if (!item) {
      return res.status(400).json({ message: 'Item not found' });
    }
    return {
      location_id,
      item_id,
    };
  });

  await transaction('locations_items').insert(newLocationsItems);

  await transaction.commit();

  return res.json({
    id: location_id,
    ...location,
  });
});

locationsRouter.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;

  const image = req.file?.filename;

  const location = await knex('locations').where('id', id).first();

  if (!location) return res.status(400).json({ message: 'Location not found' });

  await knex('locations')
    .update({ ...location, image })
    .where('id', id);

  return res.json({ ...location, image });
});

export default locationsRouter;
