import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreCartRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findCustomerByAuthUserId(authUserId: string) {
    return this.prisma.customer.findFirst({
      where: { authUserId },
      select: { id: true },
    });
  }

  async findOrCreateCart(customerId?: string) {
    if (customerId) {
      let cart = await this.prisma.cart.findFirst({
        where: { customerId },
        include: this.cartInclude,
      });
      if (!cart) {
        cart = await this.prisma.cart.create({
          data: { customerId },
          include: this.cartInclude,
        });
      }
      return cart;
    }
    return null;
  }

  async findCartById(cartId: string) {
    return this.prisma.cart.findUnique({
      where: { id: cartId },
      include: this.cartInclude,
    });
  }

  async addItem(cartId: string, productId: string, quantity: number) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId, productId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: { select: { id: true, name: true, slug: true, basePrice: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId, productId, quantity },
      include: { product: { select: { id: true, name: true, slug: true, basePrice: true } } },
    });
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    if (quantity === 0) {
      return this.prisma.cartItem.delete({ where: { id: cartItemId } });
    }
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { product: { select: { id: true, name: true, slug: true, basePrice: true } } },
    });
  }

  async removeItem(cartItemId: string) {
    return this.prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({ where: { cartId } });
  }

  private get cartInclude() {
    return {
      items: {
        include: {
          product: {
            select: {
              id: true, name: true, slug: true, basePrice: true, compareAtPrice: true,
              isActive: true, isFeatured: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    };
  }
}
