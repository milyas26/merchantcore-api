import Fastify from 'fastify';
import fastifyJwt from "@fastify/jwt";
import healthRoute from "./features/health/health.route";
import productRoutes from "./features/products/products.route";
import authRoutes from "./features/auth/auth.route";
import userRoutes from "./features/user/user.route";
import fastifyCookie from "@fastify/cookie";
import authPlugin from "./plugins/auth.plugin";

const app = Fastify({
  logger: true,
});
app.register(fastifyCookie);
app.register(fastifyJwt, {
  secret:
    process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-change-this-in-production",
  sign: {
    expiresIn: "60m",
  },
});
app.register(authPlugin);

app.register(healthRoute, { prefix: "/api" });
app.register(productRoutes, { prefix: "/api/products" });
app.register(authRoutes, { prefix: "/api/auth" });
app.register(userRoutes, { prefix: "/api/user" });

export default app;
