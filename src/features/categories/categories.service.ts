import { CategoryRepository } from "./categories.repository";
import {
  GetCategoriesResponse,
  CategoryResponse,
  ErrorResponse,
  CreateCategoryRequest,
  CreateCategoryResponse,
} from "./categories.interface";
import { AppError, ErrorHandler, ResponseHandler } from "../../utils";
import { GetCategoriesQuery, createCategorySchema } from "./categories.schema";
import { PrismaClient } from "@prisma/client";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(prisma: PrismaClient) {
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
            ErrorHandler.createError("CATEGORY_NOT_FOUND", "Parent category not found")
          );
        }
      }

      // Create category
      const category = await this.categoryRepository.createCategory(categoryData);

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
}