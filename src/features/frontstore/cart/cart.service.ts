import { FrontstoreCartRepository } from "./cart.repository";
import { ErrorHandler } from "../../../utils";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreCartService {
  private repo: FrontstoreCartRepository;

  constructor(prisma: StorePrismaClient) {
    this.repo = new FrontstoreCartRepository(prisma);
  }

  private async resolveCustomerId(authUserId: string): Promise<string> {
    const customer = await this.repo.findCustomerByAuthUserId(authUserId);
    if (!customer) {
      throw ErrorHandler.createError("NOT_FOUND", { reason: "Customer profile not found" });
    }
    return customer.id;
  }

  async getCart(authUserId: string) {
    const customerId = await this.resolveCustomerId(authUserId);
    return this.repo.findOrCreateCart(customerId);
  }

  async addItem(authUserId: string, productId: string, quantity: number) {
    const customerId = await this.resolveCustomerId(authUserId);
    const cart = await this.repo.findOrCreateCart(customerId);
    if (!cart) throw ErrorHandler.createError("UNAUTHORIZED");

    const product = await this.repo.addItem(cart.id, productId, quantity);
    const updatedCart = await this.repo.findCartById(cart.id);
    return { item: product, cart: updatedCart };
  }

  async updateItem(authUserId: string, itemId: string, quantity: number) {
    const customerId = await this.resolveCustomerId(authUserId);
    const cart = await this.repo.findOrCreateCart(customerId);
    if (!cart) throw ErrorHandler.createError("UNAUTHORIZED");
    return this.repo.updateItemQuantity(itemId, quantity);
  }

  async removeItem(authUserId: string, itemId: string) {
    const customerId = await this.resolveCustomerId(authUserId);
    const cart = await this.repo.findOrCreateCart(customerId);
    if (!cart) throw ErrorHandler.createError("UNAUTHORIZED");
    return this.repo.removeItem(itemId);
  }
}
