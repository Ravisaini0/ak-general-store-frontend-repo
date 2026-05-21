function toNumberPair(latValue, lngValue) {
  const latitude = Number(latValue);
  const longitude = Number(lngValue);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return { latitude, longitude };
}

export function parseLocationInput(rawInput = "") {
  const input = String(rawInput || "").trim();
  if (!input) {
    throw new Error("Paste a Google Maps link or enter coordinates.");
  }

  const directPair = input.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (directPair) {
    const parsed = toNumberPair(directPair[1], directPair[2]);
    if (parsed) {
      return parsed;
    }
  }

  const atPattern = input.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atPattern) {
    const parsed = toNumberPair(atPattern[1], atPattern[2]);
    if (parsed) {
      return parsed;
    }
  }

  try {
    const url = new URL(input);
    const queryCandidates = [
      url.searchParams.get("q"),
      url.searchParams.get("query"),
      url.searchParams.get("ll"),
      url.searchParams.get("destination"),
    ].filter(Boolean);

    for (const value of queryCandidates) {
      const pair = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
      if (pair) {
        const parsed = toNumberPair(pair[1], pair[2]);
        if (parsed) {
          return parsed;
        }
      }
    }
  } catch {
    // Continue to final fallback message.
  }

  throw new Error("Could not read coordinates from that Google Maps link. Paste a full maps link or direct latitude,longitude.");
}
