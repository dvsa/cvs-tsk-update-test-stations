import express from 'express';

const app = express();

const router = express.Router();

const { API_VERSION } = process.env;

/**
 * Define routing and route level middleware if necessary from ./routes
 * (GET) http://localhost:3009/<stage>/                                  (configured on AWS)
 *                                      <**>/<*>/template/               (configured/proxied from app)
 * (POST) http://localhost:3009/<stage>/                                 (configured on AWS)
 *                                      <**>/<*>/template/:id/something  (configured/proxied from app)
 */
router.get('/', (_, res, next) => {
  res.send('ok template route');
  next();
});

router.post('/:id/something', (_, res, next) => {
  res.send('ok /id/something');
  next();
});

// Defining template routes, anything before /template is proxied
app.use('/*/template/', router);

/**
 * Debug router before we start proxying
 */
app.get('/version', (_, res) => {
  res.send({ version: API_VERSION });
});

// Serverless lambda invocation debug route - local/database/base-path.json
app.get('/', (_, res) => {
  res.send({ ok: true });
});

export { app };
