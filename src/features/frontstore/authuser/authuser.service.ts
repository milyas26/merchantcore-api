import { FrontstoreAuthUserRepository } from "./authuser.repository";
import { ErrorHandler } from "../../../utils";
import type { AppError } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type { UpdateProfileBody, AddAddressBody } from "./authuser.schema";

export class FrontstoreAuthUserService {
  private repo: FrontstoreAuthUserRepository;

  constructor(prisma: StorePrismaClient) {
    this.repo = new FrontstoreAuthUserRepository(prisma);
  }

  async getProfile(authUserId: string) {
    const profile = await this.repo.findByAuthUserId(authUserId);
    if (!profile) {
      throw ErrorHandler.createError("NOT_FOUND");
    }
    return profile;
  }

  async updateProfile(authUserId: string, data: UpdateProfileBody) {
    const updated = await this.repo.updateProfile(authUserId, data);
    if (!updated) {
      throw ErrorHandler.createError("NOT_FOUND");
    }
    return updated;
  }

  async addAddress(authUserId: string, data: AddAddressBody) {
    const address = await this.repo.addAddress(authUserId, data);
    if (!address) {
      throw ErrorHandler.createError("NOT_FOUND");
    }
    return address;
  }
}
