import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreOrderRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findCustomerByAuthUserId(authUserId: string) {
    return this.prisma.customer.findFirst({
      where: { authUserId },
      select: { id: true },
    });
  }

  async createOrderFromCart(data: {
    customerId: string;
    cartId: string;
    shippingAddressId: string;
    billingAddressId: string;
    shippingMethodId?: string;
    notes?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { id: data.cartId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      let shippingCost = 0;
      if (data.shippingMethodId) {
        const method = await tx.shippingMethod.findUnique({
          where: { id: data.shippingMethodId },
        });
        if (method) {
          shippingCost = Number(method.baseCost);
        }
      }

      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.product.basePrice) * item.quantity,
        0
      );

      const order = await tx.order.create({
        data: {
          customerId: data.customerId,
          shippingAddressId: data.shippingAddressId,
          billingAddressId: data.billingAddressId,
          status: "PENDING",
          paymentStatus: "PENDING",
          fulfillmentStatus: "UNFULFILLED",
          currency: "EUR",
          subtotal,
          tax: 0,
          shipping: shippingCost,
          total: subtotal + shippingCost,
          notes: data.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.basePrice,
              total: Number(item.product.basePrice) * item.quantity,
            })),
          },
        },
        include: {
          items: { include: { product: { select: { id: true, name: true, slug: true } } } },
          shippingAddress: true,
          billingAddress: true,
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: data.cartId } });

      return order;
    });
  }

  async findOrderById(orderId: string, customerId: string) {
    return this.prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: {
        items: { include: { product: { select: { id: true, name: true, slug: true } } } },
        shippingAddress: true,
        billingAddress: true,
        fulfillments: { include: { shippingMethod: true } },
        events: { orderBy: { createdAt: "desc" } },
      },
    });
  }

  async findOrdersByCustomerId(customerId: string, limit = 20) {
    return this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        items: { include: { product: { select: { id: true, name: true, slug: true } } } },
        shippingAddress: { select: { city: true, country: true } },
        billingAddress: { select: { city: true, country: true } },
      },
    });
  }
}
