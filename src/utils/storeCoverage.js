function parseLocationLine(line = "", defaultRadiusKm = 25) {
  const separator = line.includes("|") ? "|" : ",";
  const parts = line
    .split(separator)
    .map((value) => value.trim())
    .filter(Boolean);

  if (parts.length < 3) {
    return null;
  }

  const [name, latValue, lngValue, radiusValue, mapUrl = ""] = parts;
  const latitude = Number(latValue);
  const longitude = Number(lngValue);
  const radiusKm = Number(radiusValue || defaultRadiusKm);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    name,
    latitude,
    longitude,
    radiusKm: Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : defaultRadiusKm,
    mapUrl,
  };
}

export function parseStoreLocations(rawValue = "", defaultRadiusKm = 25) {
  if (!rawValue) {
    return [];
  }

  const normalizedRadius = Number(defaultRadiusKm) || 25;
  const trimmed = rawValue.trim();

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      return parsed
        .map((item) => {
          if (!item) {
            return null;
          }

          const latitude = Number(item.latitude ?? item.lat);
          const longitude = Number(item.longitude ?? item.lng);
          const radiusKm = Number(item.radiusKm ?? item.radius ?? normalizedRadius);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return null;
          }

          return {
            name: item.name || "Store",
            latitude,
            longitude,
            radiusKm: Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : normalizedRadius,
            mapUrl: item.mapUrl || "",
          };
        })
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  return trimmed
    .split(/\r?\n/)
    .map((line) => parseLocationLine(line, normalizedRadius))
    .filter(Boolean);
}

export function serializeStoreLocations(stores = [], defaultRadiusKm = 25) {
  return stores
    .filter((store) => store?.name)
    .map((store) => {
      const radiusKm = Number(store.radiusKm || defaultRadiusKm || 25);
      return [
        store.name?.trim(),
        Number(store.latitude),
        Number(store.longitude),
        Number.isFinite(radiusKm) && radiusKm > 0 ? radiusKm : Number(defaultRadiusKm || 25),
        (store.mapUrl || "").trim(),
      ]
        .filter((value, index) => {
          if (index < 4) {
            return value !== "" && value !== null && value !== undefined;
          }
          return true;
        })
        .join("|");
    })
    .join("\n");
}

export function calculateDistanceKm(from, to) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const latDelta = toRadians(to.latitude - from.latitude);
  const lngDelta = toRadians(to.longitude - from.longitude);
  const startLat = toRadians(from.latitude);
  const endLat = toRadians(to.latitude);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestAvailableStore(userLocation, stores = []) {
  if (!userLocation || !stores.length) {
    return null;
  }

  const scoredStores = stores.map((store) => ({
    ...store,
    distanceKm: calculateDistanceKm(userLocation, store),
  }));

  const nearestStore = scoredStores.sort((left, right) => left.distanceKm - right.distanceKm)[0];

  return {
    ...nearestStore,
    available: nearestStore.distanceKm <= nearestStore.radiusKm,
  };
}
