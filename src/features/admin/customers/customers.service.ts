import { CustomersRepository } from "./customers.repository";
import { AppError, ErrorHandler, ResponseHandler } from "../../../utils";
import { CustomersValidation } from "./customers.validation";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import { GetCustomersQuery } from "./customers.schema";
import { GetCustomersResponse, ErrorResponse } from "./customers.interface";

export class CustomersService {
  private repository: CustomersRepository;

  constructor(prisma: StorePrismaClient) {
    this.repository = new CustomersRepository(prisma);
  }

  async getCustomers(query: GetCustomersQuery): Promise<GetCustomersResponse | ErrorResponse> {
    try {
      const validated = CustomersValidation.validateGetCustomersQuery(query);
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
}