import { OrdersRepository } from "./orders.repository";
import { AppError, ErrorHandler, ResponseHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetOrdersQuery } from "./orders.schema";
import { GetOrdersResponse, OrderResponse, ErrorResponse } from "./orders.interface";
import { OrdersValidation } from "./orders.validation";

export class OrdersService {
  private repository: OrdersRepository;

  constructor(prisma: StorePrismaClient) {
    this.repository = new OrdersRepository(prisma);
  }

  async getOrders(query: GetOrdersQuery): Promise<GetOrdersResponse | ErrorResponse> {
    try {
      const validated = OrdersValidation.validateGetOrdersQuery(query);
      const result = await this.repository.findMany(validated);
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getOrderById(id: string): Promise<OrderResponse | ErrorResponse> {
    try {
      const order = await this.repository.findById(id);
      if (!order) {
        return ResponseHandler.error(ErrorHandler.notFoundError("Order", id));
      }
      return ResponseHandler.success(order);
    } catch (error) {
      if (error instanceof Error && "code" in error && "message" in error && "statusCode" in error) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}