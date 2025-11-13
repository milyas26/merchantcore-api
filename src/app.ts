import Fastify from 'fastify';
import healthRoute from "./features/health/health.route";
import productRoutes from "./features/products/products.route";

const app = Fastify({
  logger: true,
});

app.register(healthRoute, { prefix: "/api" });
app.register(productRoutes, { prefix: "/api/products" });

export default app;
