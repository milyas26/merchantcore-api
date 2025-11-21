import { FastifyReply } from 'fastify';
import { UserService } from './user.service';
import { UpdateUserProfileBody, UpdatePasswordBody } from './user.interface';
import { PublicPrismaClient } from '../../../../packages/libs/db/getPrismaForSchema';
import { AuthenticatedRequest } from '../auth/auth.interface';

export class UserController {
  private userService: UserService;

  constructor(prisma: PublicPrismaClient) {
    this.userService = new UserService(prisma);
  }

  async getUserProfile(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.userId;
    const result = await this.userService.getUserProfile(userId);
    reply.code(result.success ? 200 : result.error?.statusCode || 500).send(result);
  }

  async updateUserProfile(
    request: AuthenticatedRequest<{ Body: UpdateUserProfileBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.userId;
    const result = await this.userService.updateUserProfile(userId, request.body);
    reply.code(result.success ? 200 : result.error?.statusCode || 500).send(result);
  }

  async updatePassword(
    request: AuthenticatedRequest<{ Body: UpdatePasswordBody }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user.userId;
    const result = await this.userService.updatePassword(userId, request.body);
    reply.code(result.success ? 200 : result.error?.statusCode || 500).send(result);
  }
}