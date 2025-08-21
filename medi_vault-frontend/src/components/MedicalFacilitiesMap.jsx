import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const DEFAULT_POSITION = [20.3389, 85.818]; // KIIT, Bhubaneswar

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

// Distinct user location icon
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Haversine distance calculation
const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDistance = (m) =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;

const MedicalFacilitiesMap = () => {
  const [facilities, setFacilities] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_POSITION);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [errorFacilities, setErrorFacilities] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);

  const [selectedFacilityId, setSelectedFacilityId] = useState(null);
  const listRefs = useRef({});

  // Wrap fetchFacilities in useCallback to prevent unnecessary re-creation
  const fetchFacilities = useCallback(
    async (lat, lng) => {
      try {
        setLoadingFacilities(true);
        setErrorFacilities(null);
        const res = await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/medical-facilities?lat=${lat}&lng=${lng}&type=hospital,pharmacy`
        );
        if (!res.ok) throw new Error("Failed to fetch facilities");
        let data = await res.json();

        const refPoint = userLocation || [lat, lng];

        data = data.map((f) => ({
          ...f,
          distanceMeters: haversineDistance(refPoint, [f.lat, f.lng]),
        }));

        data.sort((a, b) => a.distanceMeters - b.distanceMeters);

        setFacilities(data);
        setSelectedFacilityId(null);
      } catch (err) {
        setErrorFacilities(err.message);
        setFacilities([]);
      } finally {
        setLoadingFacilities(false);
      }
    },
    [userLocation]
  );

  // Detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          fetchFacilities(latitude, longitude);
        },
        () => {
          setMapCenter(DEFAULT_POSITION);
          fetchFacilities(DEFAULT_POSITION[0], DEFAULT_POSITION[1]);
        }
      );
    } else {
      fetchFacilities(DEFAULT_POSITION, DEFAULT_POSITION[1]);
    }
  }, [fetchFacilities]);

  // Fetch Nominatim suggestions on input debounce
  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchTerm
          )}&format=json&addressdetails=1&limit=5&countrycodes=in`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const results = await res.json();
        if (results.length === 0) {
          setSearchResults([]);
          setSearchError("No matching locations found");
        } else {
          setSearchResults(results);
          setSearchError(null);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setSearchError("Error fetching suggestions");
          setSearchResults([]);
        }
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [searchTerm]);

  // On selecting a suggestion: recenters map, fetches hospitals
  const selectSearchResult = (result) => {
    const latNum = parseFloat(result.lat);
    const lonNum = parseFloat(result.lon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      setSearchError("Invalid location coordinates.");
      return;
    }
    setMapCenter([latNum, lonNum]);
    fetchFacilities(latNum, lonNum);
    setSearchResults([]);
    setSearchTerm(result.display_name);
    setSelectedFacilityId(null);
  };

  // Search button click: if suggestions exist, select first, else fallback fetch
  const handleSearchClick = () => {
    if (searchResults.length > 0) {
      selectSearchResult(searchResults[0]);
    } else if (searchTerm.trim()) {
      (async () => {
        try {
          setLoadingFacilities(true);
          setSearchError(null);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              searchTerm
            )}&format=json&addressdetails=1&limit=1&countrycodes=in`
          );
          if (!res.ok) throw new Error("Failed to fetch location");
          const results = await res.json();
          if (results.length === 0) {
            setSearchError("Location not found. Try another search.");
            setLoadingFacilities(false);
            return;
          }
          selectSearchResult(results[0]);
          setLoadingFacilities(false);
        } catch (err) {
          setSearchError(err.message);
          setLoadingFacilities(false);
        }
      })();
    }
  };

  // Scroll list item into view when selected
  useEffect(() => {
    if (selectedFacilityId && listRefs.current[selectedFacilityId]) {
      listRefs.current[selectedFacilityId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedFacilityId]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "320px",
          overflowY: "auto",
          borderRight: "1px solid #ddd",
          padding: "10px",
          boxSizing: "border-box",
          backgroundColor: "#fafafa",
          position: "relative",
        }}
      >
        {/* Search input and button */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
          <input
            type="text"
            placeholder="Search location or hospital"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchError(null);
            }}
            style={{ flexGrow: 1, padding: "8px", boxSizing: "border-box" }}
          />
          <button
            onClick={handleSearchClick}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              border: "none",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "4px",
              userSelect: "none",
            }}
          >
            Search
          </button>
        </div>

        {/* Suggestions dropdown */}
        {searchResults.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "4px 0 10px 0",
              border: "1px solid #ccc",
              borderRadius: 4,
              maxHeight: 150,
              overflowY: "auto",
              backgroundColor: "white",
              position: "absolute",
              width: "calc(100% - 20px)",
              zIndex: 1000,
            }}
          >
            {searchResults.map((res) => (
              <li
                key={res.place_id}
                onClick={() => selectSearchResult(res)}
                style={{
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter") selectSearchResult(res);
                }}
              >
                {res.display_name}
              </li>
            ))}
          </ul>
        )}

        {searchError && <p style={{ color: "red" }}>{searchError}</p>}

        {/* Facilities list */}
        {loadingFacilities && <p>Loading medical facilities...</p>}
        {errorFacilities && <p style={{ color: "red" }}>{errorFacilities}</p>}
        {!loadingFacilities && facilities.length === 0 && <p>No facilities found.</p>}

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {facilities.map(({ id, name, lat, lng, address, emergency, distanceMeters }) => {
            const isSelected = id === selectedFacilityId;
            return (
              <li
                key={id}
                ref={(el) => (listRefs.current[id] = el)}
                onClick={() => setSelectedFacilityId(id)}
                style={{
                  padding: "10px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#cce5ff" : "#fff",
                  border: isSelected ? "2px solid #007bff" : "1px solid #ddd",
                  borderRadius: "4px",
                }}
                tabIndex={0}
              >
                <strong>{name}</strong> <br />
                <small>{address || "Address not available"}</small> <br />
                <small>Distance: {formatDistance(distanceMeters)}</small> <br />
                {emergency && <span style={{ color: "red" }}>Emergency Services</span>} <br />
                {isSelected && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${
                      userLocation ? userLocation[0] : mapCenter
                    },${userLocation ? userLocation[1] : mapCenter[1]}&destination=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Get Directions
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Map */}
      <MapContainer center={mapCenter} zoom={14} style={{ flex: 1 }} scrollWheelZoom={true}>
        <RecenterMap center={mapCenter} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {facilities.map(({ id, name, lat, lng, address, website, emergency }) => {
          const isSelected = id === selectedFacilityId;
          return (
            <Marker
              key={id}
              position={[lat, lng]}
              eventHandlers={{ click: () => setSelectedFacilityId(id) }}
              icon={
                isSelected
                  ? new L.Icon({
                      iconUrl: require("leaflet/dist/images/marker-icon-2x.png"),
                      iconSize: [28, 45],
                      iconAnchor: [14, 45],
                      popupAnchor: [0, -40],
                      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
                      shadowSize: [45, 45],
                    })
                  : new L.Icon.Default()
              }
            >
              <Popup>
                <strong>{name}</strong>
                <br />
                {address || "Address not available"}
                <br />
                {emergency && <span style={{ color: "red" }}>Emergency Services</span>}
                <br />
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MedicalFacilitiesMap;
