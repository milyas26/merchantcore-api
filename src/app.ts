import Fastify from 'fastify';
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import healthRoute from "./features/health/health.route";
import productRoutes from "./features/products/products.route";
import authRoutes from "./features/auth/auth.route";
import userRoutes from "./features/user/user.route";
import fastifyCookie from "@fastify/cookie";
import authPlugin from "./plugins/auth.plugin";

const app = Fastify({
  logger: true,
});

app.register(fastifyCors, {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL || "https://your-domain.com"
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:5174",
        ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
