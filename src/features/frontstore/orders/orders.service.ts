import { FrontstoreOrderRepository } from "./orders.repository";
import { ErrorHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreOrderService {
  private repo: FrontstoreOrderRepository;

  constructor(prisma: StorePrismaClient) {
    this.repo = new FrontstoreOrderRepository(prisma);
  }

  private async resolveCustomerId(authUserId: string): Promise<string> {
    const customer = await this.repo.findCustomerByAuthUserId(authUserId);
    if (!customer) {
      throw ErrorHandler.createError("NOT_FOUND", { reason: "Customer profile not found" });
    }
    return customer.id;
  }

  async checkout(
    authUserId: string,
    cartId: string,
    data: { shippingAddressId: string; billingAddressId: string; shippingMethodId?: string; notes?: string }
  ) {
    const customerId = await this.resolveCustomerId(authUserId);
    try {
      const order = await this.repo.createOrderFromCart({ customerId, cartId, ...data });
      return order;
    } catch (err: any) {
      if (err.message === "Cart is empty") {
        throw ErrorHandler.createError("INVALID_REQUEST", { reason: "Cart is empty" });
      }
      throw err;
    }
  }

  async getOrder(orderId: string, authUserId: string) {
    const customerId = await this.resolveCustomerId(authUserId);
    const order = await this.repo.findOrderById(orderId, customerId);
    if (!order) throw ErrorHandler.createError("NOT_FOUND");
    return order;
  }

  async getOrders(authUserId: string, limit = 20) {
    const customerId = await this.resolveCustomerId(authUserId);
    return this.repo.findOrdersByCustomerId(customerId, limit);
  }
}
