import { Order, OrderItem, OrderStatus, PaymentStatus, Cart } from '../types';
import { readJsonFile, writeJsonFile } from '../utils/fileUtils';
import { ProductModel } from './Product';
import { v4 as uuidv4 } from 'uuid';

/**
 * Order model for managing customer orders
 */
export class OrderModel {
  private static readonly ORDERS_FILE = 'data/orders.json';

  /**
   * Create new order from cart
   */
  static async createOrder(orderData: {
    userId: string;
    cart: Cart;
    shippingAddress: any;
    paymentMethod: string;
  }): Promise<Order> {
    try {
      const orders: Order[] = await readJsonFile(this.ORDERS_FILE, []);

      // Validate stock availability for all items
      for (const cartItem of orderData.cart.items) {
        const hasStock = await ProductModel.checkStock(cartItem.productId, cartItem.quantity);
        if (!hasStock) {
          const product = await ProductModel.getProductById(cartItem.productId);
          throw new Error(`Insufficient stock for product: ${product?.name || cartItem.productId}`);
        }
      }

      // Create order items with product details
      const orderItems: OrderItem[] = [];
      for (const cartItem of orderData.cart.items) {
        const product = await ProductModel.getProductById(cartItem.productId);
        if (!product) {
          throw new Error(`Product not found: ${cartItem.productId}`);
        }

        orderItems.push({
          productId: cartItem.productId,
          productName: product.name,
          quantity: cartItem.quantity,
          price: cartItem.price,
          total: cartItem.price * cartItem.quantity
        });
      }

      const newOrder: Order = {
        id: uuidv4(),
        userId: orderData.userId,
        items: orderItems,
        total: orderData.cart.total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      orders.push(newOrder);
      await writeJsonFile(this.ORDERS_FILE, orders);

      // Update product stock
      for (const item of orderItems) {
        await ProductModel.updateStock(item.productId, -item.quantity);
      }

      return newOrder;
    } catch (error) {
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  /**
   * Get orders by user ID with pagination
   */
  static async getOrdersByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      const orders: Order[] = await readJsonFile(this.ORDERS_FILE, []);
      const userOrders = orders
        .filter(order => order.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = userOrders.length;
      const startIndex = (page - 1) * limit;
      const paginatedOrders = userOrders.slice(startIndex, startIndex + limit);

      return { orders: paginatedOrders, total };
    } catch (error) {
      throw new Error(`Failed to get user orders: ${error}`);
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orders: Order[] = await readJsonFile(this.ORDERS_FILE, []);
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      throw new Error(`Failed to get order: ${error}`);
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    try {
      const orders: Order[] = await readJsonFile(this.ORDERS_FILE, []);
      const index = orders.findIndex(order => order.id === orderId);

      if (index === -1) {
        return null;
      }

      orders[index].status = status;
      orders[index].updatedAt = new Date().toISOString();

      await writeJsonFile(this.ORDERS_FILE, orders);
      return orders[index];
    } catch (error) {
      throw new Error(`Failed to update order status: ${error}`);
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order | null> {
    try {
      const orders: Order[] = await readJsonFile(this.ORDERS_FILE, []);
      const index = orders.findIndex(order => order.id === orderId);

      if (index === -1) {
        return null;
      }

      orders[index].paymentStatus = paymentStatus;
      orders[index].updatedAt = new Date().toISOString();

      // If payment is completed, update order status
      if (paymentStatus === PaymentStatus.COMPLETED && orders[index].status === OrderStatus.PENDING) {
        orders[index].status = OrderStatus.CONFIRMED;
      }

      await writeJsonFile(this.ORDERS_FILE, orders);
      return orders[index];
    } catch (error) {
      throw new Error(`Failed to update payment status: ${error}`);
    }
  }

  /**
   * Cancel order and restore stock
   */
  static async cancelOrder(orderId: string): Promise<Order | null> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        return null;
      }

      // Only allow cancellation for pending or confirmed orders
      if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
        throw new Error('Order cannot be cancelled in current status');
      }

      // Restore stock for all items
      for (const item of order.items) {
        await ProductModel.updateStock(item.productId, item.quantity);
      }

      // Update order status
      return await this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
    } catch (error) {
      throw new Error(`Failed to cancel order: ${error}`);
    }
  }

  /**
   * Get all orders (admin function)
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: OrderStatus
  ): Promise<{ orders: Order[]; total: number }> {
    try {
      const orders: Order[] = await readJsonFile(this.ORDERS_FILE, []);
      let filteredOrders = orders;

      if (status) {
        filteredOrders = orders.filter(order => order.status === status);
      }

      filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const total = filteredOrders.length;
      const startIndex = (page - 1) * limit;
      const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

      return { orders: paginatedOrders, total };
    } catch (error) {
      throw new Error(`Failed to get all orders: ${error}`);
    }
  }
}