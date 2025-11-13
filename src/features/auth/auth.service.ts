import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { 
  RegisterBody, 
  LoginBody, 
  ResetPasswordBody, 
  ConfirmResetPasswordBody, 
  RefreshTokenBody, 
  AuthResponse
} from "./auth.interface";
import { AppError } from "../../utils";
import crypto from "crypto";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(data: RegisterBody): Promise<AuthResponse | { error: AppError }> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        return {
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "User with this email already exists",
            statusCode: 400
          }
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name
        }
      });

      // Generate tokens (will be implemented in controller with JWT)
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken: "", // Will be set by controller
          refreshToken: "" // Will be set by controller
        }
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        error: {
          code: "REGISTRATION_FAILED",
          message: "Failed to register user",
          statusCode: 500
        }
      };
    }
  }

  async login(data: LoginBody): Promise<AuthResponse | { error: AppError }> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        return {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            statusCode: 401
          }
        };
      }

      // Check password
      const isValidPassword = await bcrypt.compare(data.password, user.password);
      if (!isValidPassword) {
        return {
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
            statusCode: 401
          }
        };
      }

      // Check if user is active
      if (!user.isActive) {
        return {
          error: {
            code: "USER_INACTIVE",
            message: "User account is inactive",
            statusCode: 403
          }
        };
      }

      // Generate tokens (will be implemented in controller with JWT)
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken: "", // Will be set by controller
          refreshToken: "" // Will be set by controller
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        error: {
          code: "LOGIN_FAILED",
          message: "Failed to login",
          statusCode: 500
        }
      };
    }
  }

  async resetPassword(data: ResetPasswordBody): Promise<{ success: boolean } | { error: AppError }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return { success: true };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpiresAt: resetTokenExpiresAt
        }
      });

      // TODO: Send email with reset link
      // For now, just return success
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        error: {
          code: "RESET_PASSWORD_FAILED",
          message: "Failed to reset password",
          statusCode: 500
        }
      };
    }
  }

  async confirmResetPassword(data: ConfirmResetPasswordBody): Promise<{ success: boolean } | { error: AppError }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: data.token,
          resetPasswordExpiresAt: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return {
          error: {
            code: "INVALID_OR_EXPIRED_TOKEN",
            message: "Invalid or expired reset token",
            statusCode: 400
          }
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(data.newPassword, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpiresAt: null
        }
      });

      return { success: true };
    } catch (error) {
      console.error("Confirm reset password error:", error);
      return {
        error: {
          code: "RESET_PASSWORD_CONFIRM_FAILED",
          message: "Failed to confirm password reset",
          statusCode: 500
        }
      };
    }
  }

  async refreshToken(data: RefreshTokenBody): Promise<AuthResponse | { error: AppError }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          refreshToken: data.refreshToken,
          refreshTokenExpiresAt: {
            gt: new Date()
          }
        }
      });

      if (!user) {
        return {
          error: {
            code: "INVALID_OR_EXPIRED_REFRESH_TOKEN",
            message: "Invalid or expired refresh token",
            statusCode: 401
          }
        };
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        tokens: {
          accessToken: "", // Will be set by controller
          refreshToken: "" // Will be set by controller
        }
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return {
        error: {
          code: "REFRESH_TOKEN_FAILED",
          message: "Failed to refresh token",
          statusCode: 500
        }
      };
    }
  }

  async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate refresh token (7 days)
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store refresh token in database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        refreshTokenExpiresAt
      }
    });

    // Return tokens - access token will be generated by controller using Fastify JWT
    return { accessToken: "", refreshToken };
  }
}