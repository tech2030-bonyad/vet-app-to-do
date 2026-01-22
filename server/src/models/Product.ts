import { Product, Category } from '../types';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';

/**
 * Product model for managing pet store products
 */
export class ProductModel {
  private static readonly PRODUCTS_FILE = 'data/products.json';
  private static readonly CATEGORIES_FILE = 'data/categories.json';

  /**
   * Get all products with optional filtering and pagination
   */
  static async getProducts(options: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ products: Product[]; total: number }> {
    try {
      const products: Product[] = await readJsonFile(this.PRODUCTS_FILE, []);
      let filteredProducts = products.filter(p => p.isActive);

      // Apply search filter
      if (options.search) {
        const searchTerm = options.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
        );
      }

      // Apply category filter
      if (options.category) {
        filteredProducts = filteredProducts.filter(product =>
          product.category.toLowerCase() === options.category?.toLowerCase()
        );
      }

      // Apply sorting
      if (options.sortBy) {
        filteredProducts.sort((a, b) => {
          const aValue = (a as any)[options.sortBy!];
          const bValue = (b as any)[options.sortBy!];
          
          if (options.sortOrder === 'desc') {
            return bValue > aValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }

      const total = filteredProducts.length;

      // Apply pagination
      if (options.page && options.limit) {
        const startIndex = (options.page - 1) * options.limit;
        filteredProducts = filteredProducts.slice(startIndex, startIndex + options.limit);
      }

      return { products: filteredProducts, total };
    } catch (error) {
      throw new Error(`Failed to get products: ${error}`);
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const products: Product[] = await readJsonFile(this.PRODUCTS_FILE, []);
      return products.find(p => p.id === id && p.isActive) || null;
    } catch (error) {
      throw new Error(`Failed to get product: ${error}`);
    }
  }

  /**
   * Create new product
   */
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const products: Product[] = await readJsonFile(this.PRODUCTS_FILE, []);
      
      const newProduct: Product = {
        ...productData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      products.push(newProduct);
      await writeJsonFile(this.PRODUCTS_FILE, products);
      
      return newProduct;
    } catch (error) {
      throw new Error(`Failed to create product: ${error}`);
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
      const products: Product[] = await readJsonFile(this.PRODUCTS_FILE, []);
      const index = products.findIndex(p => p.id === id);
      
      if (index === -1) {
        return null;
      }

      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await writeJsonFile(this.PRODUCTS_FILE, products);
      return products[index];
    } catch (error) {
      throw new Error(`Failed to update product: ${error}`);
    }
  }

  /**
   * Update product stock
   */
  static async updateStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const products: Product[] = await readJsonFile(this.PRODUCTS_FILE, []);
      const index = products.findIndex(p => p.id === productId);
      
      if (index === -1) {
        return false;
      }

      products[index].stock += quantity;
      products[index].updatedAt = new Date().toISOString();

      await writeJsonFile(this.PRODUCTS_FILE, products);
      return true;
    } catch (error) {
      throw new Error(`Failed to update stock: ${error}`);
    }
  }

  /**
   * Check if product has sufficient stock
   */
  static async checkStock(productId: string, requiredQuantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(productId);
      return product ? product.stock >= requiredQuantity : false;
    } catch (error) {
      throw new Error(`Failed to check stock: ${error}`);
    }
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const categories: Category[] = await readJsonFile(this.CATEGORIES_FILE, []);
      return categories.filter(c => c.isActive);
    } catch (error) {
      throw new Error(`Failed to get categories: ${error}`);
    }
  }

  /**
   * Create new category
   */
  static async createCategory(categoryData: Omit<Category, 'id' | 'createdAt'>): Promise<Category> {
    try {
      const categories: Category[] = await readJsonFile(this.CATEGORIES_FILE, []);
      
      const newCategory: Category = {
        ...categoryData,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };

      categories.push(newCategory);
      await writeJsonFile(this.CATEGORIES_FILE, categories);
      
      return newCategory;
    } catch (error) {
      throw new Error(`Failed to create category: ${error}`);
    }
  }
}