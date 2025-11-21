import { ProductRepository } from "./product.repository";
import {
  GetProductsResponse,
  ProductResponse,
  ErrorResponse,
  CreateProductRequest,
  CreateProductResponse,
} from "./products.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../utils";
import { ProductValidation } from "./products.validation";
import { GetProductsQuery, createProductSchema } from "./products.schema";
import { StorePrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { generateSlug } from "@/utils/helpers";

export class ProductService {
  private productRepository: ProductRepository;

  constructor(prisma: StorePrismaClient) {
    this.productRepository = new ProductRepository(prisma);
  }

  async getProducts(
    query: GetProductsQuery
  ): Promise<GetProductsResponse | ErrorResponse> {
    try {
      const validatedQuery = ProductValidation.validateGetProductsQuery(query);
      const result = await this.productRepository.findMany(validatedQuery);
      return {
        data: result.data,
        pagination: result.pagination,
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getProductById(id: string): Promise<ProductResponse | ErrorResponse> {
    try {
      const validatedParams = ProductValidation.validateGetProductById({ id });
      const product = await this.productRepository.findById(validatedParams.id);

      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", validatedParams.id)
        );
      }

      return ResponseHandler.success(product);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async getProductBySlug(
    slug: string
  ): Promise<ProductResponse | ErrorResponse> {
    try {
      const validatedParams = ProductValidation.validateGetProductBySlug({
        slug,
      });

      const product = await this.productRepository.findBySlug(
        validatedParams.slug
      );

      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", validatedParams.slug)
        );
      }

      return ResponseHandler.success(product);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async checkProductStock(variantId: string, quantity: number) {
    try {
      const validatedBody = ProductValidation.validateCheckStock({
        variantId,
        quantity,
      });

      const result = await this.productRepository.checkStock(
        validatedBody.variantId,
        validatedBody.quantity
      );

      return ResponseHandler.success(result);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async createProduct(
    data: CreateProductRequest
  ): Promise<CreateProductResponse | ErrorResponse> {
    try {
      // Validate input data using schema directly
      const validatedData = createProductSchema.parse(data);

      // Prepare data for repository (convert undefined to null for Prisma)
      const productData: any = {
        ...validatedData,
        description: validatedData.description || null,
        slug: generateSlug(validatedData.name),
        sku: validatedData.sku || null,
        compareAtPrice: validatedData.compareAtPrice || null,
        cost: validatedData.cost || null,
        weight: validatedData.weight || null,
        seoTitle: validatedData.seoTitle || null,
        seoDescription: validatedData.seoDescription || null,
      };

      // Check if slug already exists
      const existingProduct = await this.productRepository.findBySlug(
        productData.slug
      );
      if (existingProduct) {
        return ResponseHandler.error(
          ErrorHandler.createError(
            "CONFLICT",
            "Product with this slug already exists"
          )
        );
      }

      // Check if SKU already exists (if provided)
      if (productData.sku) {
        const existingSku = await this.productRepository.findBySku(
          productData.sku
        );
        if (existingSku) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "CONFLICT",
              "Product with this SKU already exists"
            )
          );
        }
      }

      // Check if category exists
      const category = await this.productRepository.findCategoryById(
        productData.categoryId
      );
      if (!category) {
        return ResponseHandler.error(
          ErrorHandler.createError("CATEGORY_NOT_FOUND", "Category not found")
        );
      }

      // If no variants provided, create a default variant mirroring product master
      if (!productData.variants || productData.variants.length === 0) {
        const defaultSku = productData.sku
          ? `${productData.sku}-DEFAULT`
          : `${productData.slug}-DEFAULT`;
        productData.variants = [
          {
            title: "Default",
            sku: defaultSku,
            price: productData.basePrice,
            compareAtPrice: null as any,
            cost: productData.cost || null,
            weight: productData.weight || null,
            barcode: productData.barcode || null,
            image: undefined,
            position: 0,
            isActive: productData.isActive ?? true,
            inventory: {
              quantity: 1,
              reserved: 0,
              lowStockThreshold: undefined,
            },
            options: [],
          },
        ];
      }

      // Validate variants (if provided)
      if (productData.variants && productData.variants.length > 0) {
        const variantSkus = productData.variants.map((v: any) => v.sku);
        const uniqueSkus = new Set(variantSkus);

        if (uniqueSkus.size !== variantSkus.length) {
          return ResponseHandler.error(
            ErrorHandler.createError("CONFLICT", "Duplicate variant SKUs found")
          );
        }

        // Check if variant SKUs already exist
        for (const variant of productData.variants) {
          const existingVariant = await this.productRepository.findVariantBySku(
            variant.sku
          );
          if (existingVariant) {
            return ResponseHandler.error(
              ErrorHandler.createError(
                "CONFLICT",
                `Variant SKU '${variant.sku}' already exists`
              )
            );
          }
        }
      }

      // Create product with all related data
      const product = await this.productRepository.createProduct(productData);

      return ResponseHandler.success(product);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async updateProduct(
    id: string,
    data: CreateProductRequest
  ): Promise<CreateProductResponse | ErrorResponse> {
    try {
      const validatedData = createProductSchema.parse(data);

      const product = await this.productRepository.findById(id);
      if (!product) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Product", id)
        );
      }

      const productData: any = {
        ...validatedData,
        description: validatedData.description || null,
        slug: generateSlug(validatedData.name),
        sku: validatedData.sku || null,
        compareAtPrice: validatedData.compareAtPrice || null,
        cost: validatedData.cost || null,
        weight: validatedData.weight || null,
        seoTitle: validatedData.seoTitle || null,
        seoDescription: validatedData.seoDescription || null,
      };

      const existingSlug = await this.productRepository.findBySlug(
        productData.slug
      );
      if (existingSlug && existingSlug.id !== id) {
        return ResponseHandler.error(
          ErrorHandler.createError(
            "CONFLICT",
            "Product with this slug already exists"
          )
        );
      }

      if (productData.sku) {
        const existingSku = await this.productRepository.findBySku(
          productData.sku
        );
        if (existingSku && existingSku.id !== id) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "CONFLICT",
              "Product with this SKU already exists"
            )
          );
        }
      }

      const category = await this.productRepository.findCategoryById(
        productData.categoryId
      );
      if (!category) {
        return ResponseHandler.error(
          ErrorHandler.createError("CATEGORY_NOT_FOUND", "Category not found")
        );
      }

      const existing = await this.productRepository.findById(id);
      const existingVariantCount = existing?.variants?.length ?? 0;
      const isNonVariant = existingVariantCount <= 1;

      if (isNonVariant) {
        // Enforce non-variant constraints
        const requestedVariantCount = productData.variants?.length ?? 0;
        if (requestedVariantCount === 0) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "VALIDATION_ERROR",
              "Non-variant product must have exactly 1 default variant"
            )
          );
        }
        if (requestedVariantCount !== 1) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "VALIDATION_ERROR",
              "Non-variant product cannot have more than 1 variant"
            )
          );
        }

        // Force the single variant to mirror product master attributes
        const defaultSku = productData.sku
          ? `${productData.sku}-DEFAULT`
          : `${productData.slug}-DEFAULT`;
        const incomingVariant = productData.variants![0] as any;
        productData.variants = [
          {
            title: "Default",
            sku: defaultSku,
            price: productData.basePrice,
            compareAtPrice: null as any,
            cost: productData.cost || null,
            weight: productData.weight || null,
            barcode: incomingVariant?.barcode || undefined,
            image: incomingVariant?.image || undefined,
            position: 0,
            isActive: productData.isActive ?? true,
            inventory: incomingVariant?.inventory
              ? {
                  quantity: incomingVariant.inventory.quantity,
                  reserved: incomingVariant.inventory.reserved ?? 0,
                  lowStockThreshold:
                    incomingVariant.inventory.lowStockThreshold || undefined,
                }
              : {
                  quantity: 1,
                  reserved: 0,
                  lowStockThreshold: undefined,
                },
            options: [],
          },
        ];
      }

      if (productData.variants && productData.variants.length > 0) {
        const variantSkus = productData.variants.map((v: any) => v.sku);
        const uniqueSkus = new Set(variantSkus);
        if (uniqueSkus.size !== variantSkus.length) {
          return ResponseHandler.error(
            ErrorHandler.createError("CONFLICT", "Duplicate variant SKUs found")
          );
        }
        for (const variant of productData.variants) {
          const existingVariant = await this.productRepository.findVariantBySku(
            variant.sku
          );
          if (existingVariant && existingVariant.productId !== id) {
            return ResponseHandler.error(
              ErrorHandler.createError(
                "CONFLICT",
                `Variant SKU '${variant.sku}' already exists`
              )
            );
          }
        }
      }

      const updated = await this.productRepository.updateProduct(id, productData);
      return ResponseHandler.success(updated);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        "message" in error &&
        "statusCode" in error
      ) {
        return ResponseHandler.error(error as AppError);
      }
      if (
        error instanceof Error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}
