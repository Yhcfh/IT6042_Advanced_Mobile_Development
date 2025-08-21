import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null); // Holds the user's data from Firebase
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [isEditing, setIsEditing] = useState(false); // Determines if the profile is being edited
  const [tempName, setTempName] = useState(''); // Temporary name input for editing
  const [error, setError] = useState(null); // Error state for API calls or profile loading
  const [localImage, setLocalImage] = useState(null); // Holds the local image URI for profile

  useEffect(() => {
    // Fetch user data when the component mounts
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated'); // Error if user is not logged in

        const userDoc = await getDoc(doc(db, 'users', user.uid)); // Get user document from Firestore
        if (!userDoc.exists()) throw new Error('User document not found'); // Error if document doesn't exist

        const data = userDoc.data(); // Get user data from Firestore
        setUserData(data); // Set user data to state
        setTempName(data.name || ''); // Set name for editing
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message); // Set error if something goes wrong
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchUserData(); // Call function to fetch data
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  const handleImageAction = async (actionType) => {
    // Handles both image library and camera actions based on actionType
    try {
      const permission = actionType === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync() // Request camera permission
        : await ImagePicker.requestMediaLibraryPermissionsAsync(); // Request media library permission

      if (!permission.granted) {
        Alert.alert('Permission required', `Please allow ${actionType} access`); // Alert if permission is not granted
        return;
      }

      // Launch camera or library based on actionType
      const result = await (actionType === 'camera'
        ? ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          })
        : ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          }));

      // Set local image URI if an image was selected
      if (!result.canceled && result.assets?.[0]?.uri) {
        setLocalImage(result.assets[0].uri);
        Alert.alert('Success', 'Profile image updated locally');
      }
    } catch (err) {
      console.error(`${actionType} error:`, err);
      Alert.alert('Error', `Failed to ${actionType === 'camera' ? 'take photo' : 'select image'}`); // Alert on error
    }
  };

  const handleUpdateProfile = async () => {
    // Updates profile data in Firestore
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated'); // Error if user is not authenticated

      await updateDoc(doc(db, 'users', user.uid), {
        name: tempName.trim(),
        lastUpdated: new Date() // Update the name and last updated timestamp
      });

      setUserData(prev => ({ ...prev, name: tempName.trim() })); // Update user data in state
      setIsEditing(false); // Exit edit mode
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Failed to update profile'); // Alert if update fails
    }
  };

  const handleLogout = async () => {
    // Logs the user out and redirects to login screen
    try {
      await signOut(auth);
      navigation.replace('Login'); // Navigate to login screen after sign-out
    } catch (err) {
      console.error('Logout error:', err);
      Alert.alert('Error', 'Failed to logout'); // Alert if logout fails
    }
  };

  // Loading state, show loading spinner while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error state, show error message if something went wrong
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => setLoading(true)}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile header section */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {/* Profile image display */}
          <Image
            source={{ uri: localImage || userData.profileImage || 'https://robohash.org/default-profile.png' }} 
            style={styles.profileImage}
            onError={() => setLocalImage(null)} // Reset image on error
          />
          <View style={styles.actionButtons}>
            {/* Action buttons for selecting image from library or camera */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleImageAction('library')}
            >
              <Icon name="photo-library" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => handleImageAction('camera')}
            >
              <Icon name="photo-camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Editable name input or static name display */}
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={tempName}
            onChangeText={setTempName}
            autoFocus
            placeholder="Enter your name"
            maxLength={50}
          />
        ) : (
          <Text style={styles.name}>{userData.name}</Text>
        )}
        <Text style={styles.email}>{userData.email}</Text>
        
        {/* Profile info section: Joined and Last Updated dates */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Icon name="event" size={18} color="#666" />
            <Text style={styles.infoLabel}>Joined: </Text>
            <Text style={styles.infoValue}>
              {userData.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="update" size={18} color="#666" />
            <Text style={styles.infoLabel}>Last Updated: </Text>
            <Text style={styles.infoValue}>
              {userData.lastUpdated?.toDate?.().toLocaleDateString() || 'Never'}
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons for editing profile or logging out */}
      <View style={styles.buttonGroup}>
        {isEditing ? (
          <>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleUpdateProfile}
              disabled={!tempName.trim()} // Disable button if name is empty
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={() => setIsEditing(false)} // Cancel editing
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={() => setIsEditing(true)} // Enable editing
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* Logout button */}
        <TouchableOpacity 
          style={[styles.button, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Icon name="logout" size={18} color="#fff" />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Style definitions (no changes to styles)
const styles = StyleSheet.create({
  // Style definitions here (same as before)
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#6c757d',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 25,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#007bff',
    backgroundColor: '#e9ecef',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#007bff',
    borderRadius: 20,
    padding: 5,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
    textAlign: 'center',
  },
  nameInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#007bff',
    textAlign: 'center',
    width: '80%',
    backgroundColor: '#e9ecef',
    borderRadius: 5,
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 25,
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    paddingTop: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;