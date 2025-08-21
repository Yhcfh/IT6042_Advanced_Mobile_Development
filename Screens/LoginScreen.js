import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Image } from 'react-native';
import { auth, googleProvider, db } from '../firebase'; // Import Firebase auth and Firestore
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'; // Firebase sign-in methods
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods to get user data

const LoginScreen = ({ navigation }) => {
  // Define state variables for email and password input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initialize fade animation with an opacity value of 0

  useEffect(() => {
    // This effect runs when the component mounts
    // Fades in the login screen by animating the opacity from 0 to 1
    Animated.timing(fadeAnim, {
      toValue: 1, // End value for opacity
      duration: 1000, // Duration of the fade animation (1 second)
      useNativeDriver: true, // Use native driver for better performance
    }).start(); // Start the animation
  }, [fadeAnim]);

  const handleLogin = async () => {
    // This function handles email/password login
    if (email && password) { // Check if both email and password are provided
      try {
        // Attempt to sign in with email and password
        await signInWithEmailAndPassword(auth, email, password);

        // After successful sign-in, fetch additional user data from Firestore
        const user = auth.currentUser; // Get the currently logged-in user
        const userDoc = await getDoc(doc(db, "users", user.uid)); // Get user document from Firestore
        const userData = userDoc.data(); // Extract user data from the document
        
        // Display a successful login alert with the user's name or email
        Alert.alert('Login Successful', `Welcome back, ${userData?.name || email}!`);
        navigation.replace('Home'); // Navigate to the Home screen after login
      } catch (error) {
        // If login fails, show an error message
        Alert.alert('Login Failed', error.message);
      }
    } else {
      // If email or password is missing, show an error alert
      Alert.alert('Error', 'Please enter your email and password.');
    }
  };

  const handleGoogleSignIn = async () => {
    // This function handles Google sign-in
    try {
      // Attempt to sign in with Google using Firebase's popup method
      await signInWithPopup(auth, googleProvider);
      Alert.alert('Login Successful', 'Welcome!');
      navigation.navigate('Products'); // Navigate to Products screen after successful Google sign-in
    } catch (error) {
      // If Google sign-in fails, show an error message
      Alert.alert('Google Sign-In Failed', error.message);
    }
  };

  return (
    // Animated View component with fade-in effect
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Welcome Back</Text>
      
      {/* Email input field */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail} // Update email state when the user types
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {/* Password input field */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword} // Update password state when the user types
        secureTextEntry // Hide password text
      />
      
      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Google Sign-In button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
        <Image 
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} // Google logo
          style={styles.googleIcon}
        />
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Link to SignUp screen if user doesn't have an account */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Styles for the components in the screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#007bff',
    marginTop: 15,
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
