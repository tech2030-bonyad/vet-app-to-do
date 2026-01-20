import { Cart, CartItem } from '../types';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils';
import { ProductModel } from './Product';

/**
 * Cart model for managing user shopping carts
 */
export class CartModel {
  private static readonly CARTS_FILE = 'data/carts.json';

  /**
   * Get user's cart
   */
  static async getCart(userId: string): Promise<Cart> {
    try {
      const carts: Cart[] = await readJsonFile(this.CARTS_FILE, []);
      const userCart = carts.find(cart => cart.userId === userId);

      if (!userCart) {
        // Create empty cart for user
        const newCart: Cart = {
          userId,
          items: [],
          total: 0,
          updatedAt: new Date().toISOString()
        };
        
        carts.push(newCart);
        await writeJsonFile(this.CARTS_FILE, carts);
        return newCart;
      }

      // Recalculate total and validate items
      await this.recalculateCart(userCart);
      return userCart;
    } catch (error) {
      throw new Error(`Failed to get cart: ${error}`);
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      // Validate product exists and has stock
      const product = await ProductModel.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const carts: Cart[] = await readJsonFile(this.CARTS_FILE, []);
      let cartIndex = carts.findIndex(cart => cart.userId === userId);

      if (cartIndex === -1) {
        // Create new cart
        const newCart: Cart = {
          userId,
          items: [{
            productId,
            quantity,
            price: product.price
          }],
          total: product.price * quantity,
          updatedAt: new Date().toISOString()
        };
        
        carts.push(newCart);
        await writeJsonFile(this.CARTS_FILE, carts);
        return newCart;
      }

      // Update existing cart
      const cart = carts[cartIndex];
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex !== -1) {
        // Update quantity of existing item
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        
        if (product.stock < newQuantity) {
          throw new Error('Insufficient stock for requested quantity');
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].price = product.price; // Update price in case it changed
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity,
          price: product.price
        });
      }

      cart.updatedAt = new Date().toISOString();
      await this.recalculateCart(cart);
      
      carts[cartIndex] = cart;
      await writeJsonFile(this.CARTS_FILE, carts);
      
      return cart;
    } catch (error) {
      throw new Error(`Failed to add to cart: ${error}`);
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(userId: string, productId: string, quantity: number): Promise<Cart> {
    try {
      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const carts: Cart[] = await readJsonFile(this.CARTS_FILE, []);
      const cartIndex = carts.findIndex(cart => cart.userId === userId);

      if (cartIndex === -1) {
        throw new Error('Cart not found');
      }

      const cart = carts[cartIndex];
      const itemIndex = cart.items.findIndex(item => item.productId === productId);

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity === 0) {
        // Remove item from cart
        cart.items.splice(itemIndex, 1);
      } else {
        // Validate stock
        const product = await ProductModel.getProductById(productId);
        if (!product) {
          throw new Error('Product not found');
        }

        if (product.stock < quantity) {
          throw new Error('Insufficient stock');
        }

        // Update quantity and price
        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price;
      }

      cart.updatedAt = new Date().toISOString();
      await this.recalculateCart(cart);
      
      carts[cartIndex] = cart;
      await writeJsonFile(this.CARTS_FILE, carts);
      
      return cart;
    } catch (error) {
      throw new Error(`Failed to update cart item: ${error}`);
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, productId: string): Promise<Cart> {
    try {
      return await this.updateCartItem(userId, productId, 0);
    } catch (error) {
      throw new Error(`Failed to remove from cart: ${error}`);
    }
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId: string): Promise<Cart> {
    try {
      const carts: Cart[] = await readJsonFile(this.CARTS_FILE, []);
      const cartIndex = carts.findIndex(cart => cart.userId === userId);

      if (cartIndex === -1) {
        throw new Error('Cart not found');
      }

      const cart = carts[cartIndex];
      cart.items = [];
      cart.total = 0;
      cart.updatedAt = new Date().toISOString();

      carts[cartIndex] = cart;
      await writeJsonFile(this.CARTS_FILE, carts);
      
      return cart;
    } catch (error) {
      throw new Error(`Failed to clear cart: ${error}`);
    }
  }

  /**
   * Recalculate cart total and validate items
   */
  private static async recalculateCart(cart: Cart): Promise<void> {
    let total = 0;
    const validItems: CartItem[] = [];

    for (const item of cart.items) {
      const product = await ProductModel.getProductById(item.productId);
      
      if (product && product.isActive) {
        // Update price if it has changed
        item.price = product.price;
        
        // Ensure quantity doesn't exceed stock
        if (item.quantity > product.stock) {
          item.quantity = product.stock;
        }
        
        if (item.quantity > 0) {
          total += item.price * item.quantity;
          validItems.push(item);
        }
      }
    }

    cart.items = validItems;
    cart.total = Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get cart item count
   */
  static async getCartItemCount(userId: string): Promise<number> {
    try {
      const cart = await this.getCart(userId);
      return cart.items.reduce((count, item) => count + item.quantity, 0);
    } catch (error) {
      throw new Error(`Failed to get cart item count: ${error}`);
    }
  }
}