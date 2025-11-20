import { CategoryRepository } from "./categories.repository";
import {
  GetCategoriesResponse,
  CategoryResponse,
  ErrorResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
  UpdateCategoryRequest,
  MoveCategoryRequest,
} from "./categories.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../utils";
import { GetCategoriesQuery, createCategorySchema } from "./categories.schema";
import { StorePrismaClient } from "../../../packages/libs/db/getPrismaForSchema";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(prisma: StorePrismaClient) {
    this.categoryRepository = new CategoryRepository(prisma);
  }

  async getCategories(
    query: GetCategoriesQuery
  ): Promise<GetCategoriesResponse | ErrorResponse> {
    try {
      const result = await this.categoryRepository.findMany(query);
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

  async getParentCategories(
    query: GetCategoriesQuery
  ): Promise<GetCategoriesResponse | ErrorResponse> {
    try {
      const result = await this.categoryRepository.findParents(query);
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

  async getCategoryById(id: string): Promise<CategoryResponse | ErrorResponse> {
    try {
      const category = await this.categoryRepository.findById(id);

      if (!category) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Category", id)
        );
      }

      return ResponseHandler.success(category);
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

  async getCategoryBySlug(
    slug: string
  ): Promise<CategoryResponse | ErrorResponse> {
    try {
      const category = await this.categoryRepository.findBySlug(slug);

      if (!category) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Category", slug)
        );
      }

      return ResponseHandler.success(category);
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

  async createCategory(
    data: CreateCategoryRequest
  ): Promise<CreateCategoryResponse | ErrorResponse> {
    try {
      // Validate input data using schema directly
      const validatedData = createCategorySchema.parse(data);

      // Prepare data for repository (convert undefined to null for Prisma)
      const categoryData: {
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
        parentId: string | null;
        isActive: boolean;
        sortOrder: number;
      } = {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        parentId: validatedData.parentId || null,
        isActive: validatedData.isActive ?? true,
        sortOrder: validatedData.sortOrder ?? 0,
      };

      // Check if slug already exists
      const existingCategory = await this.categoryRepository.findBySlug(
        categoryData.slug
      );
      if (existingCategory) {
        return ResponseHandler.error(
          ErrorHandler.createError(
            "DUPLICATE_SLUG",
            "Category with this slug already exists"
          )
        );
      }

      // Check if parent category exists (if provided)
      if (categoryData.parentId) {
        const parentCategory = await this.categoryRepository.findById(
          categoryData.parentId
        );
        if (!parentCategory) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "CATEGORY_NOT_FOUND",
              "Parent category not found"
            )
          );
        }
      }

      // Create category
      const category = await this.categoryRepository.createCategory(
        categoryData
      );

      return ResponseHandler.success(category);
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

  async updateCategory(
    id: string,
    data: UpdateCategoryRequest
  ): Promise<CategoryResponse | ErrorResponse> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Category", id)
        );
      }

      // If slug changes, ensure uniqueness
      if (data.slug && data.slug !== existing.slug) {
        const dup = await this.categoryRepository.findBySlug(data.slug);
        if (dup) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "DUPLICATE_SLUG",
              "Category with this slug already exists"
            )
          );
        }
      }

      // If parent provided, ensure it exists and not self
      if (data.parentId) {
        if (data.parentId === id) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "VALIDATION_ERROR",
              "Category cannot be its own parent"
            )
          );
        }
        const parent = await this.categoryRepository.findById(data.parentId);
        if (!parent) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "CATEGORY_NOT_FOUND",
              "Parent category not found"
            )
          );
        }
      }

      const updated = await this.categoryRepository.updateCategory(id, {
        name: data.name ?? existing.name,
        slug: data.slug ?? existing.slug,
        description: data.description || "",
        image: data.image ?? existing.image,
        parentId: data.parentId ?? existing.parentId,
        isActive:
          typeof data.isActive === "boolean"
            ? data.isActive
            : existing.isActive,
        sortOrder:
          typeof data.sortOrder === "number"
            ? data.sortOrder
            : existing.sortOrder,
      });

      return ResponseHandler.success(updated);
    } catch (error) {
      if (
        error instanceof Error &&
        "name" in error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async deleteCategory(id: string): Promise<{ success: true } | ErrorResponse> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Category", id)
        );
      }
      await this.categoryRepository.deleteCategory(id);
      return ResponseHandler.success({ success: true } as any);
    } catch (error) {
      if (
        error instanceof Error &&
        "name" in error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }

  async moveCategory(
    id: string,
    data: MoveCategoryRequest
  ): Promise<CategoryResponse | ErrorResponse> {
    try {
      const existing = await this.categoryRepository.findById(id);
      if (!existing) {
        return ResponseHandler.error(
          ErrorHandler.notFoundError("Category", id)
        );
      }

      let parentId: string | null = null;
      if (typeof data.parentId !== "undefined" && data.parentId !== null) {
        if (data.parentId === id) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "VALIDATION_ERROR",
              "Category cannot be its own parent"
            )
          );
        }
        const parent = await this.categoryRepository.findById(data.parentId);
        if (!parent) {
          return ResponseHandler.error(
            ErrorHandler.createError(
              "CATEGORY_NOT_FOUND",
              "Parent category not found"
            )
          );
        }
        parentId = data.parentId;
      } else {
        parentId = null;
      }

      const moved = await this.categoryRepository.moveCategory(
        id,
        parentId,
        data.sortOrder
      );
      return ResponseHandler.success(moved as any);
    } catch (error) {
      if (
        error instanceof Error &&
        "name" in error &&
        error.name === "PrismaClientKnownRequestError"
      ) {
        return ResponseHandler.error(ErrorHandler.handlePrismaError(error));
      }
      return ResponseHandler.error(ErrorHandler.handleUnknownError(error));
    }
  }
}