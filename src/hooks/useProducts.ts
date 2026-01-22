// React Query hooks for product data management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductCategory, Order } from '../types/store';

// Mock API functions - replace with actual API calls
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Dog Food',
    description: 'High-quality nutrition for adult dogs',
    price: 49.99,
    image: 'https://via.placeholder.com/300x300?text=Dog+Food',
    category: 'food',
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
    brand: 'PetNutrition',
    weight: '15 lbs'
  },
  {
    id: '2',
    name: 'Interactive Cat Toy',
    description: 'Keep your cat entertained for hours',
    price: 19.99,
    image: 'https://via.placeholder.com/300x300?text=Cat+Toy',
    category: 'toys',
    inStock: true,
    rating: 4.2,
    reviewCount: 89,
    brand: 'PlayTime'
  },
  {
    id: '3',
    name: 'Leather Dog Collar',
    description: 'Durable and stylish collar for medium dogs',
    price: 24.99,
    image: 'https://via.placeholder.com/300x300?text=Dog+Collar',
    category: 'accessories',
    inStock: true,
    rating: 4.7,
    reviewCount: 156
  },
  {
    id: '4',
    name: 'Cat Treats - Salmon',
    description: 'Delicious salmon-flavored treats',
    price: 8.99,
    image: 'https://via.placeholder.com/300x300?text=Cat+Treats',
    category: 'treats',
    inStock: false,
    rating: 4.3,
    reviewCount: 67
  },
  {
    id: '5',
    name: 'Pet Grooming Kit',
    description: 'Complete grooming set for dogs and cats',
    price: 39.99,
    image: 'https://via.placeholder.com/300x300?text=Grooming+Kit',
    category: 'grooming',
    inStock: true,
    rating: 4.6,
    reviewCount: 203
  }
];

const fetchProducts = async (): Promise<Product[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockProducts;
};

const fetchProductById = async (id: string): Promise<Product> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const product = mockProducts.find(p => p.id === id);
  if (!product) throw new Error('Product not found');
  return product;
};

const searchProducts = async (query: string): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockProducts.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.description.toLowerCase().includes(query.toLowerCase())
  );
};

export const useProducts = (category?: ProductCategory) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const products = await fetchProducts();
      return category ? products.filter(p => p.category === category) : products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
  });
};

export const useProductSearch = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length > 2,
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      // Mock orders data
      return [
        {
          id: 'ORD-001',
          items: [
            { product: mockProducts[0], quantity: 1 },
            { product: mockProducts[2], quantity: 2 }
          ],
          total: 99.97,
          status: 'delivered',
          createdAt: '2024-01-15T10:30:00Z',
          shippingAddress: {
            fullName: 'John Doe',
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '12345',
            country: 'USA'
          },
          paymentMethod: {
            type: 'credit',
            last4: '1234'
          }
        }
      ];
    }
  });
};