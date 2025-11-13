// Google OAuth Utility
// This uses Google Identity Services (GIS) library

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let googleAuthInitialized = false;
let onSuccessCallback: ((credential: string) => void) | null = null;
let onErrorCallback: ((error: string) => void) | null = null;

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google OAuth script')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
    document.head.appendChild(script);
  });
};

export const initializeGoogleAuth = (onSuccess: (credential: string) => void, onError?: (error: string) => void) => {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    if (onError) onError('Google OAuth not configured. Please contact support.');
    return;
  }

  onSuccessCallback = onSuccess;
  onErrorCallback = onError || null;

  if (googleAuthInitialized) {
    return;
  }

  loadGoogleScript()
    .then(() => {
      if (!window.google?.accounts?.id) {
        const errorMsg = 'Google OAuth library not loaded';
        console.error(errorMsg);
        if (onErrorCallback) onErrorCallback(errorMsg);
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            if (onSuccessCallback) {
              onSuccessCallback(response.credential);
            }
          } else {
            const errorMsg = 'Failed to get Google credential';
            if (onErrorCallback) onErrorCallback(errorMsg);
          }
        },
      });

      googleAuthInitialized = true;
    })
    .catch((error) => {
      console.error('Error loading Google OAuth:', error);
      if (onErrorCallback) onErrorCallback('Failed to load Google OAuth');
    });
};

export const triggerGoogleSignIn = () => {
  if (!GOOGLE_CLIENT_ID) {
    if (onErrorCallback) {
      onErrorCallback('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    }
    return;
  }

  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // User dismissed the prompt
        if (onErrorCallback) {
          onErrorCallback('Sign in was cancelled');
        }
      }
    });
  } else {
    const errorMsg = 'Google OAuth not initialized. Please wait a moment and try again.';
    console.error(errorMsg);
    if (onErrorCallback) onErrorCallback(errorMsg);
  }
};

