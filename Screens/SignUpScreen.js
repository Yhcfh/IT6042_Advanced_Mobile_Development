import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import validator from 'validator';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const SignUpScreen = ({ navigation }) => {
  // State hooks to manage form fields and validation errors
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  // Function to validate form inputs before submission
  const validateForm = () => {
    const errors = {};

    // Name validation: Checks if the name is not empty
    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    // Email validation: Checks if the email is not empty and is in correct format
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!validator.isEmail(email)) {
      errors.email = 'Invalid email format';
    }

    // Password validation: Checks multiple password rules such as length, characters, etc.
    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }

    // Update state with any validation errors
    setErrors(errors);
    // If no errors are present, return true (form is valid)
    return Object.keys(errors).length === 0;
  };

  // Function to handle sign up process
  const handleSignUp = async () => {
    // If form validation fails, exit the function
    if (!validateForm()) return;

    try {
      // 1. Create user in Firebase Authentication with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Store additional user data (name, email, etc.) in Firestore database
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        createdAt: new Date(),
        // You can add more fields here if needed
      });

      // Show success alert after successful signup
      Alert.alert('Sign Up Successful', `Welcome, ${name}!`);
      // Navigate to the Login screen after successful sign up
      navigation.navigate('Login');
    } catch (error) {
      // Show error alert if sign up fails
      Alert.alert('Sign Up Failed', error.message);
    }
  };

  // Return JSX for the SignUp screen UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {/* Name input field */}
      <TextInput
        style={[styles.input, errors.name && styles.inputError]} // Apply error style if there's a validation error
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName} // Update state with input value
      />
      {/* Show error message if name validation fails */}
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      {/* Email input field */}
      <TextInput
        style={[styles.input, errors.email && styles.inputError]} // Apply error style if there's a validation error
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail} // Update state with input value
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Show error message if email validation fails */}
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Password input field */}
      <TextInput
        style={[styles.input, errors.password && styles.inputError]} // Apply error style if there's a validation error
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword} // Update state with input value
        secureTextEntry // Hide password input
      />
      {/* Show error message if password validation fails */}
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Sign Up button that triggers the sign up process */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Link to navigate to the Login screen if the user already has an account */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signInText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styling for the SignUpScreen component
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
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputError: {
    borderColor: 'red', // Highlight input fields with errors
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
  signInText: {
    color: '#007bff',
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

export default SignUpScreen;
