import React, { useState, useEffect } from 'react'; 
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import QRCode from 'react-native-qrcode-svg';
import { registerForPushNotificationsAsync, sendOrderConfirmationNotification } from '../notificationService';

const CheckoutScreen = ({ route, navigation }) => {
  const { cart } = route.params || { cart: [] };
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    // Register for push notifications when component mounts
    registerForPushNotificationsAsync();
  }, []);

  const handlePayment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to make a purchase");
        return;
      }
  
      const order = {
        items: cart,
        total,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
  
      const docRef = await addDoc(collection(db, 'orders'), order);
      const orderDetails = {
        orderId: docRef.id,
        items: cart.map(item => item.id),
        purchaseDate: new Date().toISOString()
      };
      
      setOrderDetails(orderDetails);
      setOrderPlaced(true);
      
      // Send notification for each book purchased
      cart.forEach(item => {
        sendOrderConfirmationNotification(docRef.id, item.title);
      });
      
      Alert.alert("Payment Success", "Order has been placed!");
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "Could not process order.");
    }
  };

  const handleContinueShopping = () => {
    // Only navigate after user clicks "Continue Shopping"
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>${item.price.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>
      {!orderPlaced ? (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => `${item.id}_${index}`}
          />
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <Text style={styles.payText}>Pay Now</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>Payment Successful!</Text>
          <Text style={styles.qrTitle}>Your Book Access QR Codes:</Text>
          
          <FlatList
            data={cart}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            renderItem={({ item }) => (
              <View style={styles.qrItem}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <QRCode
                  value={item.fileUrl || `book:${item.id}`}  // Use fileUrl if available
                  size={200}
                  color="black"
                  backgroundColor="white"
                />
                {item.fileUrl && (
                  <Text style={styles.downloadText}>Scan to download/read</Text>
                )}
              </View>
            )}
          />
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinueShopping}
          >
            <Text style={styles.continueText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  itemContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 16 },
  price: { fontSize: 16 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalPrice: { fontSize: 18, fontWeight: 'bold' },
  payButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  payText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  qrItem: {
    alignItems: 'center',
    marginBottom: 30,
  },
  bookTitle: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  downloadText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});

export default CheckoutScreen;