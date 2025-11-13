import Fastify from 'fastify';
import healthRoute from './modules/health/health.route';

const app = Fastify({
  logger: true
});

app.register(healthRoute, { prefix: '/api' });

export default app;
