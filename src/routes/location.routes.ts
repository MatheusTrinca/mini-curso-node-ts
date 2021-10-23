import { Router } from 'express';
import knex from '../database/connection';
import multer from 'multer';
import multerConfig from '../config/multer';
import { celebrate, Joi } from 'celebrate';
import isAuthenticated from '../middlewares/isAuthenicated';

const locationsRouter = Router();

const upload = multer(multerConfig);

locationsRouter.use(isAuthenticated);

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

locationsRouter.post(
  '/',
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        whatsapp: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        city: Joi.string().required(),
        uf: Joi.string().required().max(2),
        items: Joi.array().required(),
      }),
    },
    {
      abortEarly: false,
    }
  ),
  async (request, response) => {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } =
      request.body;

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

    const locationItems = items.map((item_id: number) => {
      const selectedItem = transaction('items').where('id', item_id).first();

      if (!selectedItem) {
        return response.status(400).json({ message: 'Item not found.' });
      }

      return {
        item_id,
        location_id,
      };
    });

    await transaction('locations_items').insert(locationItems);

    await transaction.commit();

    return response.json({
      id: location_id,
      ...location,
    });
  }
);

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
