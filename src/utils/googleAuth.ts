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

// Queue of containers waiting to have buttons rendered after init
const pendingRenderContainers: Array<{ container: HTMLElement; text: string }> = [];

export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
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

/**
 * Renders Google's official sign-in button into the given container element.
 * Uses renderButton which opens a reliable popup flow (not One Tap).
 * Call this after initializeGoogleAuth has been called.
 */
export const renderGoogleButton = (
  container: HTMLElement,
  text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin' = 'signin_with'
): void => {
  if (!GOOGLE_CLIENT_ID) return;

  if (!window.google?.accounts?.id || !googleAuthInitialized) {
    // Queue it to be rendered once init completes
    pendingRenderContainers.push({ container, text });
    return;
  }

  try {
    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      width: Math.min(container.offsetWidth || 400, 400),
    });
  } catch (e) {
    console.warn('Google renderButton failed:', e);
  }
};

export const initializeGoogleAuth = (
  onSuccess: (credential: string) => void,
  onError?: (error: string) => void,
  onReady?: () => void
) => {
  if (!GOOGLE_CLIENT_ID) {
    console.warn('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    if (onError) onError('Google OAuth not configured. Please contact support.');
    return;
  }

  onSuccessCallback = onSuccess;
  onErrorCallback = onError || null;

  if (googleAuthInitialized) {
    if (onReady) onReady();
    // Flush any pending containers
    pendingRenderContainers.splice(0).forEach(({ container, text }) =>
      renderGoogleButton(container, text)
    );
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

      if (onReady) onReady();

      // Flush any containers that were queued before init completed
      pendingRenderContainers.splice(0).forEach(({ container, text }) =>
        renderGoogleButton(container, text)
      );
    })
    .catch((error) => {
      console.error('Error loading Google OAuth:', error);
      if (onErrorCallback) onErrorCallback('Failed to load Google OAuth');
    });
};

/**
 * @deprecated Use renderGoogleButton() with a container ref instead.
 * This kept for backward compatibility but pages should migrate to renderButton.
 */
export const triggerGoogleSignIn = () => {
  if (!GOOGLE_CLIENT_ID) {
    if (onErrorCallback) {
      onErrorCallback('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file');
    }
    return;
  }

  if (!window.google?.accounts?.id || !googleAuthInitialized) {
    // Attempt a self-heal init path so button clicks still work if GIS wasn't ready yet.
    loadGoogleScript()
      .then(() => {
        if (!window.google?.accounts?.id) {
          if (onErrorCallback) onErrorCallback('Google OAuth library not loaded');
          return;
        }

        if (!googleAuthInitialized) {
          if (!onSuccessCallback) {
            if (onErrorCallback) onErrorCallback('Google sign-in is initializing. Please try again.');
            return;
          }

          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              if (response.credential) {
                if (onSuccessCallback) onSuccessCallback(response.credential);
              } else if (onErrorCallback) {
                onErrorCallback('Failed to get Google credential');
              }
            },
          });
          googleAuthInitialized = true;
        }

        triggerGoogleSignIn();
      })
      .catch(() => {
        if (onErrorCallback) onErrorCallback('Failed to load Google OAuth');
      });
    return;
  }

  // Render the button in a hidden off-screen container and click it.
  // This uses renderButton (popup flow) which is more reliable than prompt().
  const HIDDEN_ID = '__gsi_trigger_container__';
  let hidden = document.getElementById(HIDDEN_ID) as HTMLElement | null;
  if (!hidden) {
    hidden = document.createElement('div');
    hidden.id = HIDDEN_ID;
    hidden.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:200px;height:44px;overflow:hidden;pointer-events:none;opacity:0;';
    document.body.appendChild(hidden);
  }
  // Clear and re-render
  hidden.innerHTML = '';
  hidden.style.pointerEvents = 'auto';

  try {
    window.google.accounts.id.renderButton(hidden, {
      type: 'standard',
      size: 'large',
      text: 'signin_with',
      width: 200,
    });

    // Give the iframe a moment to render, then click it
    setTimeout(() => {
      const iframe = hidden!.querySelector('iframe');
      if (iframe) {
        iframe.click();
      } else {
        (hidden as HTMLElement).click();
      }
      hidden!.style.pointerEvents = 'none';
    }, 100);
  } catch (e) {
    console.warn('triggerGoogleSignIn renderButton failed:', e);
    if (onErrorCallback) onErrorCallback('Google sign-in failed to open. Please try again.');
  }
};

