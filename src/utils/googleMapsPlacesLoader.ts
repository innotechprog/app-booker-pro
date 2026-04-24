/**
 * Loads Maps JavaScript API with the `places` library (once per page).
 * Enable “Maps JavaScript API” and “Places API” for your key in Google Cloud Console.
 */

let loadPromise: Promise<void> | null = null;

export function isGoogleMapsPlacesLoaded(): boolean {
  return typeof window !== "undefined" && Boolean(window.google?.maps?.places);
}

export function loadGoogleMapsPlacesScript(apiKey: string): Promise<void> {
  if (isGoogleMapsPlacesLoaded()) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = `__googleMapsPlacesCb_${Date.now()}`;
    (window as unknown as Record<string, () => void>)[callbackName] = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      resolve();
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete (window as unknown as Record<string, unknown>)[callbackName];
      loadPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
