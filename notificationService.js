// notificationService.js
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export const registerForPushNotificationsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
  
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo push token:', token);
    return token;
  } catch (error) {
    console.log('Error getting push token:', error);
  }
};

// Send a local notification
export const sendOrderConfirmationNotification = (orderId, bookTitle) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: `Your order #${orderId} has been confirmed!`,
      body: `Your e-book "${bookTitle}" is ready to download. Tap to access!`,
      data: { 
        url: Linking.createURL(`/order/${orderId}`),
        orderId 
      },
      sound: 'default',
    },
    trigger: null, // Send immediately
  });
};