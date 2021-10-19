import express from 'express';
import routes from './router';

const app = express();

app.use(routes);

app.listen(3333, () => {
  console.log('Server started on PORT 3333!');
});
