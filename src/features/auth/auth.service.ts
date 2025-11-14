import bcrypt from "bcryptjs";
import {
  RegisterBody,
  LoginBody,
  ResetPasswordBody,
  ConfirmResetPasswordBody,
  RefreshTokenBody,
  AuthResponse,
} from "./auth.interface";
import { AppError } from "../../utils";
import crypto from "crypto";
import { PublicPrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { AuthRepository } from "./auth.repository";

export class AuthService {
  private authRepository: AuthRepository;

  constructor(prisma: PublicPrismaClient) {
    this.authRepository = new AuthRepository(prisma);
  }

  async register(
    data: RegisterBody
  ): Promise<AuthResponse | { error: AppError }> {
    try {
      const existingUser = await this.authRepository.findUserByEmail(
        data.email
      );

      if (existingUser) {
        return {
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "User with this email already exists",
            statusCode: 400,
          },
        };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await this.authRepository.createUser({
        email: data.email,
        password: hashedPassword,
        name: data.name,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: "USER",
        },
        tokens: {
          accessToken: "",
          refreshToken: "",
        },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        error: {
          code: "REGISTRATION_FAILED",
          message: "Failed to register user",
          statusCode: 500,
        },
      };
    }
  }

  async login(data: LoginBody): Promise<AuthResponse | { error: AppError }> {
    try {
      const user = await this.authRepository.findUserByEmail(data.email);

      if (!user) {
        return {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            statusCode: 401,
          },
        };
      }

      const isValidPassword = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!isValidPassword) {
        return {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            statusCode: 401,
          },
        };
      }

      if (!user.isActive) {
        return {
          error: {
            code: "USER_INACTIVE",
            message: "User account is inactive",
            statusCode: 403,
          },
        };
      }
      const currentStore = await this.authRepository.findFirstStoreByUserId(
        user.id
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: "USER",
        },
        tokens: {
          accessToken: "",
          refreshToken: "",
        },
        currentStore: currentStore
          ? {
              id: currentStore.store.id,
              name: currentStore.store.name,
              slug: currentStore.store.slug,
              description: currentStore.store.description,
              role: currentStore.role,
            }
          : null,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        error: {
          code: "LOGIN_FAILED",
          message: "Failed to login",
          statusCode: 500,
        },
      };
    }
  }

  async resetPassword(
    data: ResetPasswordBody
  ): Promise<{ success: boolean } | { error: AppError }> {
    try {
      const user = await this.authRepository.findUserByEmail(data.email);

      if (!user) {
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        error: {
          code: "RESET_PASSWORD_FAILED",
          message: "Failed to reset password",
          statusCode: 500,
        },
      };
    }
  }

  async confirmResetPassword(
    _data: ConfirmResetPasswordBody
  ): Promise<{ success: boolean } | { error: AppError }> {
    try {
      return { success: true };
    } catch (error) {
      console.error("Confirm reset password error:", error);
      return {
        error: {
          code: "RESET_PASSWORD_CONFIRM_FAILED",
          message: "Failed to confirm password reset",
          statusCode: 500,
        },
      };
    }
  }

  async refreshToken(
    data: RefreshTokenBody
  ): Promise<AuthResponse | { error: AppError }> {
    try {
      const refreshToken = await this.authRepository.findRefreshTokenWithUser(
        data.refreshToken
      );

      if (!refreshToken || !refreshToken.user) {
        return {
          error: {
            code: "INVALID_OR_EXPIRED_REFRESH_TOKEN",
            message: "Invalid or expired refresh token",
            statusCode: 401,
          },
        };
      }

      // Fetch user's stores and memberships to get current store
      const userStores = await this.authRepository.findStoresByUserId(
        refreshToken.user.id
      );

      // Get the first store (or null if no stores)
      const currentStore = userStores.length > 0 ? userStores[0] : null;

      return {
        user: {
          id: refreshToken.user.id,
          email: refreshToken.user.email,
          name: refreshToken.user.name || "",
          role: "USER",
        },
        tokens: {
          accessToken: "",
          refreshToken: "",
        },
        currentStore: currentStore
          ? {
              id: currentStore.store.id,
              name: currentStore.store.name,
              slug: currentStore.store.slug,
              description: currentStore.store.description,
              role: currentStore.role,
            }
          : null,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return {
        error: {
          code: "REFRESH_TOKEN_FAILED",
          message: "Failed to refresh token",
          statusCode: 500,
        },
      };
    }
  }

  async generateTokens(
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // 7 days

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: userId,
      expiresAt: refreshTokenExpiresAt,
    });

    return { accessToken: "", refreshToken };
  }

  async logout(
    userId: string
  ): Promise<{ success: boolean } | { error: AppError }> {
    try {
      await this.authRepository.deleteRefreshTokensByUserId(userId);

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        error: {
          code: "LOGOUT_FAILED",
          message: "Failed to logout",
          statusCode: 500,
        },
      };
    }
  }
}
