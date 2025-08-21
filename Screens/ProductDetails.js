import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductDetails = ({ route }) => {
  const { product } = route.params; // Destructuring product from route params
  const fadeAnim = useRef(new Animated.Value(0)).current; // Creating a fade animation reference
  const navigation = useNavigation(); // Getting navigation object from React Navigation

  React.useEffect(() => {
    // Starting the fade animation when the component is mounted
    Animated.timing(fadeAnim, {
      toValue: 1, // Final opacity value
      duration: 500, // Animation duration
      useNativeDriver: true, // Using native driver for better performance
    }).start(); // Start the animation
  }, [fadeAnim]); // Dependency array to ensure animation runs on mount

  const handlePurchase = () => {
    // Navigate to Checkout screen with the product in the cart
    navigation.navigate('Checkout', { cart: [product] });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Animated view for fade-in effect */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Displaying the product image */}
        <Image 
          source={{ uri: product.coverImageUrl }} 
          style={styles.productImage} 
          resizeMode="contain" // Ensure the image fits within the container
        />
        
        <View style={styles.content}>
          {/* Displaying the product title */}
          <Text style={styles.title}>{product.title}</Text>
          
          {/* Displaying the author */}
          <Text style={styles.author}>by {product.author}</Text>
          
          {/* Rating and reviews section */}
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>{product.rating || 4.5} ★</Text>
            <Text style={styles.reviews}>({product.reviewsCount || 0} reviews)</Text>
          </View>
          
          {/* Displaying the product price */}
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          
          {/* Product description section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
          
          {/* Product categories section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {/* Loop through categories and display each one */}
              {product.categories?.map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* Purchase button */}
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={handlePurchase} // Handle purchase action
          >
            <Text style={styles.buyButtonText}>Purchase Now</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 350,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rating: {
    fontSize: 16,
    color: '#FFA500',
    fontWeight: 'bold',
    marginRight: 10,
  },
  reviews: {
    fontSize: 14,
    color: '#888',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#e1f0ff',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#007bff',
    fontSize: 14,
  },
  buyButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProductDetails;
