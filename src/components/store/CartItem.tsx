// Cart item component for cart screen
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ImageStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../../types/store';
import { useCartStore } from '../../store/cartStore';

interface CartItemProps {
  item: CartItemType;
  onProductPress?: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onProductPress
}) => {
  const { updateQuantity, removeItem } = useCartStore();
  const { product, quantity } = item;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeItem(product.id);
  };

  const subtotal = product.price * quantity;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => onProductPress?.(product.id)}
        activeOpacity={0.7}
      >
        <Image source={{ uri: product.image }} style={styles.image} />
      </TouchableOpacity>

      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => onProductPress?.(product.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          {product.brand && (
            <Text style={styles.brand}>{product.brand}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {quantity > 1 && (
            <Text style={styles.subtotal}>
              Subtotal: ${subtotal.toFixed(2)}
            </Text>
          )}
        </View>

        <View style={styles.controls}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity - 1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="remove" size={20} color="#007AFF" />
            </TouchableOpacity>

            <Text style={styles.quantity}>{quantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(quantity + 1)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="add" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  imageContainer: {
    marginRight: 12,
  } as ViewStyle,

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  } as ImageStyle,

  content: {
    flex: 1,
    justifyContent: 'space-between',
  } as ViewStyle,

  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  } as TextStyle,

  brand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  } as TextStyle,

  priceContainer: {
    marginBottom: 12,
  } as ViewStyle,

  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  } as TextStyle,

  subtotal: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  } as TextStyle,

  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 4,
  } as ViewStyle,

  quantityButton: {
    padding: 8,
    borderRadius: 16,
  } as ViewStyle,

  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    minWidth: 30,
    textAlign: 'center',
  } as TextStyle,

  removeButton: {
    padding: 8,
  } as ViewStyle,
});