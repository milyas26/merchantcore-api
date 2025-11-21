import bcrypt from "bcryptjs";
import type { AuthResponse, LoginBody, RegisterBody } from "./auth.interface";
import { ErrorHandler, type AppError } from "@/utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { FrontstoreAuthRepository } from "./auth.repository";

export class FrontstoreAuthService {
  private repo: FrontstoreAuthRepository;

  constructor(prisma: StorePrismaClient) {
    this.repo = new FrontstoreAuthRepository(prisma);
  }

  async login(data: LoginBody): Promise<AuthResponse | { error: AppError }> {
    try {
      const user = await this.repo.findAuthUserByEmail(data.email);

      if (!user || !user.passwordHash) {
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
        user.passwordHash
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

      if (user.status !== "ACTIVE") {
        return {
          error: {
            code: "USER_SUSPENDED",
            message: "User account is suspended",
            statusCode: 403,
          },
        };
      }

      await this.repo.updateLastLogin(user.id);

      const displayName = user.customer
        ? `${user.customer.firstName} ${user.customer.lastName}`
        : "";

      return {
        user: {
          id: user.id,
          email: user.email,
          name: displayName,
          role: "CUSTOMER",
        },
        tokens: {
          accessToken: "",
          refreshToken: "",
        },
      };
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return { error: appError };
    }
  }

  async register(data: RegisterBody): Promise<
    | { user: { id: string; email: string; name: string; role: string } }
    | { error: AppError }
  > {
    try {
      const existing = await this.repo.findAuthUserByEmail(data.email);
      if (existing) {
        return {
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "User with this email already exists",
            statusCode: 400,
          },
        };
      }

      const passwordHash = await bcrypt.hash(data.password, 10);
      const created = await this.repo.createAuthUserAndCustomer({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      const name = `${created.customer.firstName} ${created.customer.lastName}`;
      return {
        user: {
          id: created.auth.id,
          email: created.auth.email,
          name,
          role: "CUSTOMER",
        },
      };
    } catch (error) {
      const appError = ErrorHandler.handleUnknownError(error);
      return { error: appError };
    }
  }
}