/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { UpdateUserProfileBody, UpdatePasswordBody } from "./user.interface";

export class UserValidation {
  private static updateProfileSchema = z
    .object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .optional(),
      email: z
        .string()
        .email("Invalid email format")
        .max(255, "Email must be less than 255 characters")
        .optional(),
    })
    .transform((data) => ({
      name: data.name,
      email: data.email,
    }))
    .refine((data) => data.name || data.email, {
      message: "At least one field (name or email) must be provided",
      path: ["name", "email"],
    });

  private static updatePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long")
      .max(128, "New password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
  });

  static validateUpdateProfile(data: any): UpdateUserProfileBody {
    try {
      const validated = this.updateProfileSchema.parse(data);
      // Filter out undefined values to match UpdateUserProfileBody interface
      const result: UpdateUserProfileBody = {};
      if (validated.name !== undefined) result.name = validated.name;
      if (validated.email !== undefined) result.email = validated.email;
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          statusCode: 400,
          errors: validationErrors,
        };
      }
      throw error;
    }
  }

  static validateUpdatePassword(data: any): UpdatePasswordBody {
    try {
      return this.updatePasswordSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        throw {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          statusCode: 400,
          errors: validationErrors,
        };
      }
      throw error;
    }
  }
}
