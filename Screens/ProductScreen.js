import React, { useState, useEffect, useRef } from 'react'; // Importing necessary React hooks and modules
import { View, Text, StyleSheet, FlatList, Image, Animated, TouchableOpacity, Dimensions } from 'react-native'; // Importing components from React Native library
import { db } from '../firebase'; // Importing Firebase database
import { collection, getDocs } from 'firebase/firestore'; // Importing methods to fetch data from Firestore
import { useNavigation } from '@react-navigation/native'; // Importing navigation hook to navigate between screens

// const { width } = Dimensions.get('window'); // Getting the screen width for responsive design
const CARD_HEIGHT = 300; // Defining a constant height for product cards

const ProductScreen = () => {
  const [products, setProducts] = useState([]); // State to hold the products fetched from Firestore
  const [loading, setLoading] = useState(true); // State to manage loading state (whether products are being fetched)
  const scrollY = useRef(new Animated.Value(0)).current; // Creating an animated value to control the scroll position for animations
  const navigation = useNavigation(); // Using navigation hook to navigate between screens
  const [cart, setCart] = useState([]); // State to manage the cart (items the user wants to purchase)

  // useEffect hook to clear the cart when the screen is focused (when user returns to this screen)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setCart([]); // Clears the cart when navigating back to this screen
    });
    return unsubscribe; // Cleanup function to remove the listener when the component unmounts
  }, [navigation]);

  // useEffect hook to fetch product data from Firestore once the component is mounted
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "ebooks")); // Fetching all products from "ebooks" collection in Firestore
        const productList = querySnapshot.docs.map(doc => ({
          id: doc.id, // Getting document ID
          ...doc.data() // Getting all the data from the Firestore document
        }));
        setProducts(productList); // Updating the state with the fetched product list
      } catch (error) {
        console.error("Error fetching products:", error); // Handling any errors that occur during the fetch
      } finally {
        setLoading(false); // Setting loading state to false once products are fetched
      }
    };

    fetchProducts(); // Calling the fetchProducts function to load data
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Function to navigate to the product details screen when a product card is pressed
  const navigateToDetails = (product) => {
    navigation.navigate('ProductDetails', { product }); // Navigating to 'ProductDetails' screen and passing product data as a parameter
  };

  // Function to render each product card in the list
  const renderItem = ({ item, index }) => {
    const inputRange = [
      -1,
      0,
      CARD_HEIGHT * index,
      CARD_HEIGHT * (index + 3),
    ]; // Defining the scroll position ranges for animations
    
    // Interpolating values for opacity based on scroll position
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0], // The opacity changes as we scroll
    });

    // Interpolating values for scaling based on scroll position
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.8], // The card scales down as we scroll
    });

    // Interpolating values for translating the card along Y-axis based on scroll position
    const translateY = scrollY.interpolate({
      inputRange,
      outputRange: [0, 0, 0, -50], // The card moves upwards as we scroll
    });

    // Rendering each product card with animations
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigateToDetails(item)}>
        {/* TouchableOpacity allows tapping the card */}
        <Animated.View 
          style={[
            styles.productCard, // Applying styles for the card
            { 
              opacity, // Animating opacity
              transform: [{ scale }, { translateY }], // Applying scale and translation animations
            }
          ]}
        >
          <Image 
            source={{ uri: item.coverImageUrl }} // Displaying product image from the URL
            style={styles.productImage} // Applying styles to the image
            resizeMode="cover" // Ensuring the image covers the area without distortion
          />
          <View style={styles.productInfo}> 
            {/* Displaying product information below the image */}
            <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
            {/* Displaying the product title, limiting to one line */}
            <Text style={styles.productAuthor} numberOfLines={1}>by {item.author}</Text>
            {/* Displaying the product author */}
            
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{item.rating || 4.5} ★</Text>
              {/* Displaying the product rating, defaulting to 4.5 if unavailable */}
              <Text style={styles.reviewsText}>({item.reviewsCount || 0} reviews)</Text>
              {/* Displaying the number of reviews, defaulting to 0 if unavailable */}
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
              {/* Displaying the product price formatted to two decimal places */}
              <TouchableOpacity 
                style={styles.buyButton} 
                onPress={(e) => {
                  e.stopPropagation(); // Prevents event from bubbling up to the parent
                  setCart(prev => [...prev, item]); // Adds the item to the cart
                  navigation.navigate('Checkout', { cart: [...cart, item] }); // Navigates to Checkout screen with the updated cart
                }}
              >
                <Text style={styles.buyButtonText}>Buy Now</Text>
                {/* Displaying a 'Buy Now' button */}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Main view container */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {/* Displaying loading state */}
          <Text style={styles.loadingText}>Loading products...</Text>
          {/* Displaying loading text */}
        </View>
      ) : (
        <Animated.FlatList
          data={products} // Passing the products array to FlatList
          renderItem={renderItem} // Rendering each product using renderItem function
          keyExtractor={(item) => item.id} // Extracting unique key for each item using product ID
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true } // Handling the scroll event and linking it to the animated scrollY value
          )}
          scrollEventThrottle={16} // Setting throttle for scroll events to optimize performance
          contentContainerStyle={styles.listContainer} // Applying styles to the list container
          showsVerticalScrollIndicator={false} // Hiding the scroll indicator
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Defining styles for the components
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: CARD_HEIGHT,
  },
  productImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 15,
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  productAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFA500',
    fontWeight: 'bold',
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 12,
    color: '#888',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    elevation: 2,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ProductScreen;
