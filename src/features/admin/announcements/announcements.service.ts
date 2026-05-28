import { AnnouncementRepository } from "./announcements.repository";
import type {
  GetAnnouncementsResponse,
  AnnouncementResponse,
  ErrorResponse,
} from "./announcements.interface";
import type {
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "./announcements.schema";
import { AnnouncementValidation } from "./announcements.validation";
import { AppError, ErrorHandler, ResponseHandler } from "../../../utils";
import type { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class AnnouncementService {
  private repository: AnnouncementRepository;

  constructor(prisma: StorePrismaClient) {
    this.repository = new AnnouncementRepository(prisma);
  }

  async getAnnouncements(query: any): Promise<GetAnnouncementsResponse | ErrorResponse> {
    try {
      const validated = AnnouncementValidation.validateGetAnnouncementsQuery(query);
      const result = await this.repository.findMany(validated);
      return result as any;
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getAnnouncementById(id: string): Promise<AnnouncementResponse | ErrorResponse> {
    try {
      const announcement = await this.repository.findById(id);
      if (!announcement) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Announcement", id));
      }
      return ResponseHandler.success(announcement);
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async createAnnouncement(
    data: CreateAnnouncementRequest,
    createdBy: string
  ): Promise<AnnouncementResponse | ErrorResponse> {
    try {
      const validated = AnnouncementValidation.validateCreateAnnouncement(data);
      const announcement = await this.repository.create(validated, createdBy);
      return ResponseHandler.success(announcement);
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async updateAnnouncement(
    id: string,
    data: UpdateAnnouncementRequest
  ): Promise<AnnouncementResponse | ErrorResponse> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Announcement", id));
      }

      const validated = AnnouncementValidation.validateUpdateAnnouncement(data);
      const announcement = await this.repository.update(id, validated);
      return ResponseHandler.success(announcement);
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async deleteAnnouncement(id: string): Promise<{ success: boolean } | ErrorResponse> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Announcement", id));
      }
      await this.repository.delete(id);
      return { success: true };
    } catch (error: any) {
      if (error?.code && error?.message && error?.statusCode) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}
