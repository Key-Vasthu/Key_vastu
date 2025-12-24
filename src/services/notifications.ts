/**
 * Browser Notification Service
 * Handles browser push notifications for new chat messages
 */

import type { ChatMessage } from '../types';

const SERVICE_WORKER_PATH = '/sw.js';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }

  return Notification.permission;
};

/**
 * Register service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
    console.log('Service worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Subscribe with VAPID key if available
      const options: PushSubscriptionOptionsInit = VAPID_PUBLIC_KEY
        ? {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          }
        : {
            userVisibleOnly: true,
          };

      subscription = await registration.pushManager.subscribe(options);
      console.log('Push subscription created:', subscription);
    }

    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return null;
  }
};

/**
 * Show browser notification for new message
 */
export const showChatNotification = (
  message: ChatMessage,
  senderName: string,
  options?: NotificationOptions
): void => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(`${senderName} sent a message`, {
      body: message.content.length > 100 
        ? message.content.substring(0, 100) + '...' 
        : message.content,
      icon: message.senderAvatar || '/favicon.svg',
      badge: '/favicon.svg',
      tag: `chat-${message.senderId}`,
      requireInteraction: false,
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // In production, navigate to the chat thread
      if (window.location.pathname !== '/chat') {
        window.location.href = '/chat';
      }
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }
};

/**
 * Send email notification (stub - would call backend API)
 */
export const sendChatEmailNotification = async (
  email: string,
  senderName: string,
  message: ChatMessage
): Promise<void> => {
  // In production, this would call your backend API
  // Example: await fetch('/api/notifications/email', { method: 'POST', body: ... })
  console.log('Email notification would be sent to:', email, 'from:', senderName, 'message:', message.content.substring(0, 50));
};

/**
 * Convert VAPID key from URL base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Push subscription removed');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Unsubscribe failed:', error);
    return false;
  }
};

