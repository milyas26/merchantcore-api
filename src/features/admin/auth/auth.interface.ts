import { FastifyRequest } from "fastify";
import type { RouteGenericInterface } from "fastify";

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface ResetPasswordBody {
  email: string;
}

export interface ConfirmResetPasswordBody {
  token: string;
  newPassword: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  currentStore?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    role: string;
  } | null;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest<RouteGeneric extends RouteGenericInterface = RouteGenericInterface>
  extends FastifyRequest<RouteGeneric> {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}
