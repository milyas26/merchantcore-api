import {
  getAnnouncementsQuerySchema,
  createAnnouncementSchema,
  updateAnnouncementSchema,
  type GetAnnouncementsQuery,
  type CreateAnnouncementRequest,
  type UpdateAnnouncementRequest,
} from "./announcements.schema";
import { ErrorHandler } from "../../../utils";
import { ZodError } from "zod";

export class AnnouncementValidation {
  static validateGetAnnouncementsQuery(query: GetAnnouncementsQuery) {
    try {
      return getAnnouncementsQuerySchema.parse(query);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ErrorHandler.validationError(
          "Invalid query parameters",
          error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
        );
      }
      throw error;
    }
  }

  static validateCreateAnnouncement(data: CreateAnnouncementRequest) {
    try {
      return createAnnouncementSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ErrorHandler.validationError(
          "Invalid announcement data",
          error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
        );
      }
      throw error;
    }
  }

  static validateUpdateAnnouncement(data: UpdateAnnouncementRequest) {
    try {
      return updateAnnouncementSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw ErrorHandler.validationError(
          "Invalid announcement data",
          error.errors.map((e) => ({ field: e.path.join("."), message: e.message }))
        );
      }
      throw error;
    }
  }
}
