/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetProductsQuery, CreateProductRequest } from "./products.interface";
import { StorePrismaClient } from "../../../packages/libs/db/getPrismaForSchema";

export class ProductRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetProductsQuery) {
    const {
      page = 1,
      limit = 20,
      q,
      category,
      published = true,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: published,
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Get total count
    const total = await this.prisma.product.count({ where });

    // Get products with relations
    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        variants: {
          select: {
            id: true,
            productId: true,
            title: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            cost: true,
            weight: true,
            barcode: true,
            image: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            inventory: {
              select: {
                quantity: true,
                reserved: true,
                lowStockThreshold: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            productId: true,
            url: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    return await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        variants: {
          select: {
            id: true,
            productId: true,
            title: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            cost: true,
            weight: true,
            image: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        images: {
          select: {
            id: true,
            productId: true,
            url: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        variants: {
          select: {
            id: true,
            productId: true,
            title: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            cost: true,
            weight: true,
            image: true,
            position: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        images: {
          select: {
            id: true,
            productId: true,
            url: true,
            alt: true,
            position: true,
            createdAt: true,
          },
          orderBy: {
            position: "asc",
          },
        },
        attributes: {
          select: {
            id: true,
            productId: true,
            name: true,
            value: true,
            position: true,
          },
        },
      },
    });
  }

  async checkStock(variantId: string, quantity: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { variantId: variantId },
      select: {
        id: true,
        quantity: true,
        reserved: true,
      },
    });

    if (!inventory) {
      return { available: false, message: "Inventory not found for variant" };
    }

    const availableStock = inventory.quantity - inventory.reserved;

    if (availableStock < quantity) {
      return {
        available: false,
        message: `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`,
        availableStock,
        requestedQuantity: quantity,
      };
    }

    return {
      available: true,
      availableStock,
      requestedQuantity: quantity,
    };
  }

  async reserveStock(variantId: string, quantity: number) {
    return await this.prisma.inventory.update({
      where: { variantId: variantId },
      data: {
        reserved: {
          increment: quantity,
        },
      },
    });
  }

  async releaseStock(variantId: string, quantity: number) {
    return await this.prisma.inventory.update({
      where: { variantId: variantId },
      data: {
        reserved: {
          decrement: quantity,
        },
      },
    });
  }

  async finalizeStock(variantId: string, quantity: number) {
    return await this.prisma.$transaction(async (tx) => {
      // Decrease quantity and reserved in inventory
      const inventory = await tx.inventory.update({
        where: { variantId: variantId },
        data: {
          quantity: {
            decrement: quantity,
          },
          reserved: {
            decrement: quantity,
          },
        },
      });

      return inventory;
    });
  }

  async findBySku(sku: string) {
    return await this.prisma.product.findUnique({
      where: { sku },
      select: { id: true, sku: true },
    });
  }

  async findVariantBySku(sku: string) {
    return await this.prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true, sku: true, productId: true },
    });
  }

  async findCategoryById(id: string) {
    console.log("findCategoryById", id);
    return await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
  }

  async createProduct(data: CreateProductRequest) {
    return await this.prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          categoryId: data.categoryId,
          sku: data.sku || null,
          basePrice: data.basePrice,
          compareAtPrice: data.compareAtPrice || null,
          cost: data.cost || null,
          weight: data.weight || null,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          trackInventory: data.trackInventory ?? true,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      // Create images if provided
      if (data.images && data.images.length > 0) {
        await tx.productImage.createMany({
          data: data.images.map((image, index) => ({
            productId: product.id,
            url: image.url,
            alt: image.alt || null,
            position: image.position ?? index,
          })),
        });
      }

      // Create variants if provided
      if (data.variants && data.variants.length > 0) {
        for (const variant of data.variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              title: variant.title,
              sku: variant.sku,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice || null,
              cost: variant.cost || null,
              weight: variant.weight || null,
              barcode: variant.barcode || null,
              image: variant.image || null,
              position: variant.position ?? 0,
              isActive: variant.isActive ?? true,
            },
          });

          // Create inventory if provided
          if (variant.inventory) {
            await tx.inventory.create({
              data: {
                variantId: createdVariant.id,
                quantity: variant.inventory.quantity,
                reserved: variant.inventory.reserved ?? 0,
                lowStockThreshold: variant.inventory.lowStockThreshold || null,
              },
            });
          }

          // Create variant options if provided
          if (variant.options && variant.options.length > 0) {
            await tx.variantOption.createMany({
              data: variant.options.map((option) => ({
                variantId: createdVariant.id,
                optionName: option.optionName,
                optionValue: option.optionValue,
              })),
            });
          }
        }
      }

      // Create attributes if provided
      if (data.attributes && data.attributes.length > 0) {
        await tx.productAttribute.createMany({
          data: data.attributes.map((attribute) => ({
            productId: product.id,
            name: attribute.name,
            value: attribute.value,
            position: attribute.position ?? 0,
          })),
        });
      }

      // Return complete product with relations
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          variants: {
            select: {
              id: true,
              productId: true,
              title: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              cost: true,
              weight: true,
              barcode: true,
              image: true,
              position: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              inventory: {
                select: {
                  quantity: true,
                  reserved: true,
                  lowStockThreshold: true,
                },
              },
              options: {
                select: {
                  id: true,
                  optionName: true,
                  optionValue: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              productId: true,
              url: true,
              alt: true,
              position: true,
              createdAt: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          attributes: {
            select: {
              id: true,
              name: true,
              value: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      });
    });
  }

  async updateProduct(id: string, data: CreateProductRequest) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          categoryId: data.categoryId,
          sku: data.sku || null,
          basePrice: data.basePrice,
          compareAtPrice: data.compareAtPrice || null,
          cost: data.cost || null,
          weight: data.weight || null,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          trackInventory: data.trackInventory ?? true,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
        },
      });

      if (data.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (data.images.length > 0) {
          await tx.productImage.createMany({
            data: data.images.map((image, index) => ({
              productId: id,
              url: image.url,
              alt: image.alt || null,
              position: image.position ?? index,
            })),
          });
        }
      }

      if (data.variants) {
        const variants = await tx.productVariant.findMany({
          where: { productId: id },
          select: { id: true },
        });
        if (variants.length > 0) {
          const variantIds = variants.map((v) => v.id);
          await tx.variantOption.deleteMany({
            where: { variantId: { in: variantIds } },
          });
          await tx.inventory.deleteMany({
            where: { variantId: { in: variantIds } },
          });
          await tx.productVariant.deleteMany({
            where: { id: { in: variantIds } },
          });
        }
        if (data.variants.length > 0) {
          for (const variant of data.variants) {
            const createdVariant = await tx.productVariant.create({
              data: {
                productId: id,
                title: variant.title,
                sku: variant.sku,
                price: variant.price,
                compareAtPrice: variant.compareAtPrice || null,
                cost: variant.cost || null,
                weight: variant.weight || null,
                barcode: variant.barcode || null,
                image: variant.image || null,
                position: variant.position ?? 0,
                isActive: variant.isActive ?? true,
              },
            });
            if (variant.inventory) {
              await tx.inventory.create({
                data: {
                  variantId: createdVariant.id,
                  quantity: variant.inventory.quantity,
                  reserved: variant.inventory.reserved ?? 0,
                  lowStockThreshold:
                    variant.inventory.lowStockThreshold || null,
                },
              });
            }
            if (variant.options && variant.options.length > 0) {
              await tx.variantOption.createMany({
                data: variant.options.map((option) => ({
                  variantId: createdVariant.id,
                  optionName: option.optionName,
                  optionValue: option.optionValue,
                })),
              });
            }
          }
        }
      }

      if (data.attributes) {
        await tx.productAttribute.deleteMany({ where: { productId: id } });
        if (data.attributes.length > 0) {
          await tx.productAttribute.createMany({
            data: data.attributes.map((attribute) => ({
              productId: id,
              name: attribute.name,
              value: attribute.value,
              position: attribute.position ?? 0,
            })),
          });
        }
      }

      return await tx.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          variants: {
            select: {
              id: true,
              productId: true,
              title: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              cost: true,
              weight: true,
              barcode: true,
              image: true,
              position: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              inventory: {
                select: {
                  quantity: true,
                  reserved: true,
                  lowStockThreshold: true,
                },
              },
              options: {
                select: {
                  id: true,
                  optionName: true,
                  optionValue: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              productId: true,
              url: true,
              alt: true,
              position: true,
              createdAt: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          attributes: {
            select: {
              id: true,
              name: true,
              value: true,
              position: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      });
    });
  }
}
