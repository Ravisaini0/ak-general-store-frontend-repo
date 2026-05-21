import { LoaderCircle, MapPin, Navigation, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentPosition } from "../../utils/location";
import Button from "./Button";
import Modal from "./Modal";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_ID = "ak-google-maps-script";
const GOOGLE_MAPS_CALLBACK = "__akInitGoogleMaps";
const DEFAULT_CENTER = { latitude: 28.016278, longitude: 74.964194 };

function normalizeQuery(query) {
  return query.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
}

function buildSearchCandidates(query) {
  const normalized = normalizeQuery(query);
  const withoutPostalCode = normalized.replace(/\b\d{6}\b/g, "").replace(/\s+,/g, ",").trim();
  const parts = normalized
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(
    [
      normalized,
      withoutPostalCode,
      parts.slice(0, 3).join(", "),
      parts.slice(-3).join(", "),
      parts.slice(-2).join(", "),
      normalized.replace(/[-/]/g, " "),
    ]
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

async function fetchSearchCandidate(query) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=6&q=${encodeURIComponent(
      query
    )}`
  );

  if (!response.ok) {
    throw new Error("Location search is unavailable right now.");
  }

  return response.json();
}

async function fallbackSearchLocations(query) {
  const candidates = buildSearchCandidates(query);
  const collected = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const results = await fetchSearchCandidate(candidate);
    for (const item of results) {
      const key = `${item.lat}:${item.lon}:${item.display_name}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      collected.push({
        latitude: Number(item.lat),
        longitude: Number(item.lon),
        label: item.display_name,
      });
    }

    if (collected.length >= 6) {
      break;
    }
  }

  return collected.slice(0, 6);
}

async function fallbackReverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
  );

  if (!response.ok) {
    throw new Error("Current location could not be resolved.");
  }

  const payload = await response.json();
  return payload.display_name || "Selected delivery location";
}

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      resolve(null);
      return;
    }

    if (typeof window === "undefined") {
      reject(new Error("Google Maps is unavailable in this environment."));
      return;
    }

    if (window.google?.maps) {
      resolve(window.google);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Google Maps could not be loaded.")),
        { once: true }
      );
      return;
    }

    window[GOOGLE_MAPS_CALLBACK] = () => resolve(window.google);

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&v=weekly&callback=${GOOGLE_MAPS_CALLBACK}`;
    script.onerror = () => reject(new Error("Google Maps could not be loaded."));
    document.body.appendChild(script);
  });
}

async function geocodeAddressWithGoogle(geocoder, address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode(
      {
        address,
        componentRestrictions: { country: "IN" },
      },
      (results, status) => {
        if (status === "ZERO_RESULTS") {
          resolve([]);
          return;
        }

        if (status !== "OK") {
          reject(new Error("Google address lookup is unavailable right now."));
          return;
        }

        resolve(
          (results || []).slice(0, 6).map((item) => ({
            latitude: item.geometry.location.lat(),
            longitude: item.geometry.location.lng(),
            label: item.formatted_address,
          }))
        );
      }
    );
  });
}

export default function LocationPickerModal({
  open,
  onClose,
  onApply,
  title = "Choose Delivery Location",
  defaultLabel = "",
  initialCoordinates = null,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const googleEnabledRef = useRef(false);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
    initialCoordinates?.latitude && initialCoordinates?.longitude
      ? {
          latitude: Number(initialCoordinates.latitude),
          longitude: Number(initialCoordinates.longitude),
          label: defaultLabel || "Saved delivery location",
        }
      : null
  );
  const [searching, setSearching] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState(Boolean(GOOGLE_MAPS_API_KEY));
  const [error, setError] = useState("");

  const mapCenter = useMemo(
    () =>
      selectedLocation
        ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
        : { lat: DEFAULT_CENTER.latitude, lng: DEFAULT_CENTER.longitude },
    [selectedLocation]
  );

  const updateMarker = (google, location, shouldCenter = true) => {
    if (!mapInstanceRef.current || !location) {
      return;
    }

    if (!markerRef.current) {
      markerRef.current = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      markerRef.current.addListener("dragend", async (event) => {
        const latitude = event.latLng.lat();
        const longitude = event.latLng.lng();
        const label = await reverseGeocode(latitude, longitude);
        setSelectedLocation({ latitude, longitude, label });
      });
    } else {
      markerRef.current.setPosition({ lat: location.latitude, lng: location.longitude });
    }

    if (shouldCenter) {
      mapInstanceRef.current.panTo({ lat: location.latitude, lng: location.longitude });
      mapInstanceRef.current.setZoom(16);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    if (googleEnabledRef.current && geocoderRef.current) {
      return new Promise((resolve) => {
        geocoderRef.current.geocode({ location: { lat: latitude, lng: longitude } }, (resultsList) => {
          resolve(resultsList?.[0]?.formatted_address || "Selected delivery location");
        });
      });
    }

    return fallbackReverseGeocode(latitude, longitude);
  };

  const handleMapSelection = async (latitude, longitude) => {
    const label = await reverseGeocode(latitude, longitude);
    setSelectedLocation({ latitude, longitude, label });
    setError("");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearch("");
    setResults([]);
    setError("");
    setSelectedLocation(
      initialCoordinates?.latitude && initialCoordinates?.longitude
        ? {
            latitude: Number(initialCoordinates.latitude),
            longitude: Number(initialCoordinates.longitude),
            label: defaultLabel || "Saved delivery location",
          }
        : null
    );
  }, [defaultLabel, initialCoordinates, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled = false;

    async function initGoogleMap() {
      try {
        setLoadingMap(true);
        const google = await loadGoogleMapsScript();

        if (cancelled) {
          return;
        }

        if (!google?.maps || !mapRef.current) {
          setGoogleAvailable(false);
          setGoogleReady(false);
          googleEnabledRef.current = false;
          return;
        }

        googleEnabledRef.current = true;
        setGoogleAvailable(true);
        setGoogleReady(true);
        geocoderRef.current =
          typeof google.maps.Geocoder === "function" ? new google.maps.Geocoder() : null;

        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: selectedLocation ? 16 : 13,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        mapInstanceRef.current.addListener("click", async (event) => {
          await handleMapSelection(event.latLng.lat(), event.latLng.lng());
        });

        markerRef.current = null;

        updateMarker(
          google,
          selectedLocation || {
            latitude: DEFAULT_CENTER.latitude,
            longitude: DEFAULT_CENTER.longitude,
            label: defaultLabel || "Saved delivery location",
          },
          true
        );
      } catch (mapError) {
        if (!cancelled) {
          setGoogleAvailable(false);
          setGoogleReady(false);
          googleEnabledRef.current = false;
          setError(mapError.message || "Google Maps could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setLoadingMap(false);
        }
      }
    }

    initGoogleMap();

    return () => {
      cancelled = true;
      markerRef.current = null;
      mapInstanceRef.current = null;
    };
  }, [defaultLabel, mapCenter, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    if (search.trim().length < 3) {
      setResults([]);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        setError("");

        if (googleEnabledRef.current && geocoderRef.current) {
          const geocodedMatches = await geocodeAddressWithGoogle(geocoderRef.current, search.trim());
          if (geocodedMatches.length) {
            setResults(geocodedMatches);
            return;
          }
        }

        const matches = await fallbackSearchLocations(search);
        setResults(matches);
      } catch (searchError) {
        setResults([]);
        setError(searchError.message || "Location search failed.");
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [open, search]);

  useEffect(() => {
    if (!googleReady || !window.google || !selectedLocation) {
      return;
    }

    updateMarker(window.google, selectedLocation, true);
  }, [googleReady, selectedLocation]);

  const handleSearch = async () => {
    if (!search.trim()) {
      setError("Search for an address, landmark, apartment, office, or area.");
      setResults([]);
      return;
    }

    try {
      setSearching(true);
      setError("");

      if (googleEnabledRef.current && geocoderRef.current) {
        const geocodedMatches = await geocodeAddressWithGoogle(geocoderRef.current, search.trim());
        if (geocodedMatches.length) {
          setResults(geocodedMatches);
          setSelectedLocation(geocodedMatches[0]);
          setSearching(false);
          return;
        }
      }

      const matches = await fallbackSearchLocations(search);
      if (!matches.length) {
        throw new Error("No matching location found. Try a more specific delivery address.");
      }

      setResults(matches);
      setSelectedLocation(matches[0]);
    } catch (searchError) {
      setResults([]);
      setError(searchError.message || "Location search failed.");
      setSearching(false);
    }
  };

  const handleSelectResult = async (item) => {
    try {
      setError("");

      setSelectedLocation(item);
    } catch (selectionError) {
      setError(selectionError.message || "This location could not be selected.");
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      setCapturing(true);
      setError("");
      const coords = await getCurrentPosition();
      const label = await reverseGeocode(coords.latitude, coords.longitude).catch(
        () => "Current location"
      );

      setSelectedLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        label,
      });
      setResults([]);
    } catch (locationError) {
      setError(locationError.message || "Current location could not be captured.");
    } finally {
      setCapturing(false);
    }
  };

  const handleApply = () => {
    if (!selectedLocation?.latitude || !selectedLocation?.longitude) {
      setError("Select a delivery location before continuing.");
      return;
    }

    onApply(selectedLocation);
    onClose();
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-3 rounded-[1.2rem] border border-slate-200 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              placeholder="Search apartment, office, street, landmark, or pincode"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="accent"
              type="button"
              className="w-full px-5 py-3 font-black"
              onClick={handleSearch}
            >
              {searching ? "Searching..." : "Search Location"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="w-full px-5 py-3 font-black"
              onClick={handleUseCurrentLocation}
            >
              {capturing ? "Capturing..." : "Use Current Location"}
            </Button>
          </div>
        </div>

        {googleAvailable ? (
          <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-100">
            <div ref={mapRef} className="h-[280px] w-full" />
            {googleReady ? (
              <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                Tap anywhere on the map or drag the marker to fine-tune the delivery location.
              </div>
            ) : null}
          </div>
        ) : null}

        {loadingMap ? (
          <div className="flex items-center gap-2 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <LoaderCircle size={16} className="animate-spin" />
            Loading map...
          </div>
        ) : null}

        {results.length ? (
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Matching Locations
            </p>
            <div className="space-y-3">
              {results.map((item) => {
                const isActive =
                  selectedLocation?.latitude === item.latitude &&
                  selectedLocation?.longitude === item.longitude &&
                  !item.placeId;

                return (
                  <button
                    key={item.placeId || `${item.latitude}-${item.longitude}-${item.label}`}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className={`w-full rounded-[1.3rem] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-yellow-400 bg-yellow-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-yellow-100 p-2 text-yellow-700">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Delivery here</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.label}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {!results.length && search.trim().length >= 3 && !searching && !error ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Keep typing a more specific address, such as area + city or landmark + pincode.
          </div>
        ) : null}

        {selectedLocation ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                <Navigation size={16} />
              </div>
              <div>
                <p className="font-black text-emerald-900">Selected delivery location</p>
                <p className="mt-1 leading-6">{selectedLocation.label}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Select a delivery spot to continue. This is required before saving the address.
          </div>
        )}

        {error ? (
          <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            variant="accent"
            type="button"
            className="px-5 py-3 font-black"
            onClick={handleApply}
          >
            Confirm Delivery Location
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="px-5 py-3 font-black"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
