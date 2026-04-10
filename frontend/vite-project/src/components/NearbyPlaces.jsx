import { useEffect, useState } from "react";
import "./NearbyPlaces.css";

function formatDistance(distanceMeters) {
  if (distanceMeters === null || distanceMeters === undefined) {
    return "Distance unavailable";
  }

  if (distanceMeters < 1000) {
    return `${distanceMeters} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}

function NearbyPlaces({ latitude, longitude }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchNearbyPlaces = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:5000/api/places/nearby?latitude=${latitude}&longitude=${longitude}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load nearby places");
        }

        setPlaces(data.places || []);
      } catch (err) {
        setError(err.message || "Failed to fetch nearby places");
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [latitude, longitude]);

  return (
    <div className="land-details-section">
      <h3>Nearby Places</h3>

      {loading && (
        <p className="nearby-places-message">Loading nearby places...</p>
      )}

      {error && <p className="error-message nearby-places-message">{error}</p>}

      {!loading && !error && places.length > 0 && (
        <div className="nearby-places-grid">
          {places.map((place) => (
            <div key={place.key} className="nearby-place-card">
              <span>{place.label}</span>
              <strong>{place.name}</strong>
              <p>{place.found ? formatDistance(place.distanceMeters) : "Not found nearby"}</p>
              {place.found && place.address && (
                <small>{place.address}</small>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && !error && places.length === 0 && (
        <p className="nearby-places-message">
          Nearby place information is not available for this location.
        </p>
      )}
    </div>
  );
}

export default NearbyPlaces;