// Product card component for catalog display
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
import { Product } from '../../types/store';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style
}) => {
  const { addItem, getItemQuantity } = useCartStore();
  const cartQuantity = getItemQuantity(product.id);

  const handleAddToCart = (e: any) => {
    e.stopPropagation(); // Prevent card press when adding to cart
    addItem(product);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={12} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#FFD700" />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
        {cartQuantity > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        
        {product.brand && (
          <Text style={styles.brand}>{product.brand}</Text>
        )}

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(product.rating)}
          </View>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          
          <TouchableOpacity
            style={[
              styles.addButton,
              !product.inStock && styles.addButtonDisabled
            ]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <Ionicons 
              name="add" 
              size={20} 
              color={product.inStock ? '#fff' : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  } as ViewStyle,

  imageContainer: {
    position: 'relative',
    height: 200,
  } as ViewStyle,

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  } as ImageStyle,

  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  outOfStockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,

  cartBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  } as TextStyle,

  content: {
    padding: 12,
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

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  stars: {
    flexDirection: 'row',
    marginRight: 6,
  } as ViewStyle,

  reviewCount: {
    fontSize: 12,
    color: '#666',
  } as TextStyle,

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  } as TextStyle,

  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  addButtonDisabled: {
    backgroundColor: '#f0f0f0',
  } as ViewStyle,
});