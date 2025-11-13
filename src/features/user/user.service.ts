/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./user.repository";
import { UpdateUserProfileBody, UpdatePasswordBody } from "./user.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../utils";
import bcrypt from "bcryptjs";
import { UserValidation } from "./user.validation";

export class UserService {
  private userRepository: UserRepository;

  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
  }

  async getUserProfile(userId: string) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("User", userId)
        );
      }

      return ResponseHandler.success(user);
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async updateUserProfile(userId: string, data: UpdateUserProfileBody) {
    try {
      // Validate input data
      const validatedData = UserValidation.validateUpdateProfile(data);

      // Check if user exists
      const existingUser = await this.userRepository.findById(userId);
      if (!existingUser) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("User", userId)
        );
      }

      // Check if email is already taken by another user
      if (validatedData.email) {
        const emailExists = await this.userRepository.findByEmailExcludeId(
          validatedData.email,
          userId
        );
        
        if (emailExists) {
          return ResponseHandler.error(
            ErrorHandler.validationError("Email is already taken by another user", [
              { field: "email", message: "Email must be unique" }
            ])
          );
        }
      }

      // Update user profile
      const updateData: any = {};
      if (validatedData.name) updateData.name = validatedData.name;
      if (validatedData.email) updateData.email = validatedData.email;

      const updatedUser = await this.userRepository.update(userId, updateData);

      return ResponseHandler.success(updatedUser);
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async updatePassword(userId: string, data: UpdatePasswordBody) {
    try {
      // Validate input data
      const validatedData = UserValidation.validateUpdatePassword(data);

      // Check if user exists
      const user = await this.userRepository.findByIdWithPassword(userId);
      if (!user) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("User", userId)
        );
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(validatedData.currentPassword, user.password);
      if (!isValidPassword) {
        return ResponseHandler.error(
          ErrorHandler.validationError("Current password is incorrect", [
            { field: "currentPassword", message: "Invalid current password" }
          ])
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

      // Update password
      await this.userRepository.updatePassword(userId, hashedPassword);

      return ResponseHandler.success({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}