export function getCurrentPosition(options = {}) {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.reject(new Error("Location access is unavailable on this device."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => reject(new Error("Please enable location access to continue.")),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000,
        ...options,
      }
    );
  });
}
