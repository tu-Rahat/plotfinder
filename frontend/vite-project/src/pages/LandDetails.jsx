import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LandDetails.css";
import NearbyPlaces from "../components/NearbyPlaces";
import Building3DPreview from "../components/Building3DPreview";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


function LandDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const [formData, setFormData] = useState({
    buyerFirstName: storedUser?.firstName || "",
    buyerLastName: storedUser?.lastName || "",
    buyerEmail: storedUser?.email || "",
    buyerPhone: "",
    offeredPrice: "",
    purpose: "",
    preferredContactMethod: "phone",
    message: "",
  });

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const latitude = land?.location?.latitude ? Number(land.location.latitude) : null;
  const longitude = land?.location?.longitude ? Number(land.location.longitude) : null;
  const hasMapLocation = latitude && longitude;

  const renderStars = (rating) => {
    const value = Math.round(Number(rating) || 0);
    const filledStars = Math.max(0, Math.min(5, value));
    return "★".repeat(filledStars) + "☆".repeat(5 - filledStars);
  };

  const getWeatherLabel = (code) => {
  const weatherMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Moderate showers",
    82: "Heavy showers",
    95: "Thunderstorm",
  };

  return weatherMap[code] || "Unknown weather";
};

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lands/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load land details");
        }

        setLand(data);
        // ✅ Fetch weather after land loads
        if (data?.location?.latitude && data?.location?.longitude) {
          try {
            setWeatherLoading(true);

            const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${data.location.latitude}&longitude=${data.location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
                );

          const weatherData = await weatherRes.json();

          if (!weatherRes.ok) {
            throw new Error("Failed to fetch weather data");
          }

    setWeather(weatherData.current);
  } catch (err) {
    setWeatherError(err.message || "Failed to load weather");
  } finally {
    setWeatherLoading(false);
  }
}
      } catch (error) {
        setRequestError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLand();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBuyRequestSubmit = async (e) => {
    e.preventDefault();

    setRequestMessage("");
    setRequestError("");

    if (!token || !storedUser) {
      setRequestError("Please log in as a user to send a buy request.");
      return;
    }

    try {
      const payload = {
        landId: id,
        ...formData,
      };

      const response = await fetch("http://localhost:5000/api/buy-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit buy request");
      }

      setRequestMessage(data.message);

      setFormData((prev) => ({
        ...prev,
        buyerPhone: "",
        offeredPrice: "",
        purpose: "",
        preferredContactMethod: "phone",
        message: "",
      }));
    } catch (error) {
      setRequestError(error.message);
    }
  };

  if (loading) {
    return <p className="land-details-message">Loading land details...</p>;
  }

  if (!land) {
    return <p className="land-details-message">Land not found.</p>;
  }
  const handleChatWithSeller = async () => {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!token || !storedUser) {
      navigate("/login");
      return;
    }

    if (storedUser.role !== "user") {
      return;
    }

    if (land?.sellerId && storedUser.id === land.sellerId) {
      alert("You cannot chat on your own land post.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/chat/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          landId: land._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to open chat");
      }

      navigate("/messages");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className="land-details-page">
      <div className="land-details-grid">
        <div className="land-details-main">
          <span className="land-details-type">{land.landType}</span>
          <h1>{land.title}</h1>
          <p className="land-details-price">৳ {Number(land.price).toLocaleString()}</p>

          <p className="land-details-description">{land.description}</p>

          <div className="land-details-info-grid">
            <div className="land-info-box">
              <span>Size</span>
              <strong>{land.landSizeSqft} sqft</strong>
            </div>
            <div className="land-info-box">
              <span>Ownership</span>
              <strong>{land.ownershipType || "Not specified"}</strong>
            </div>
            <div className="land-info-box">
              <span>Road Access</span>
              <strong>{land.roadAccess || "Not specified"}</strong>
            </div>
            <div className="land-info-box">
              <span>Negotiable</span>
              <strong>{land.priceNegotiable ? "Yes" : "No"}</strong>
            </div>
          </div>

          {land.overallRating > 0 && (
            <div className="land-rating-summary">
              <h3>Property Ranking</h3>
              <p>
                <strong>Overall:</strong> {renderStars(land.overallRating)} ({Number(land.overallRating).toFixed(1)})
              </p>
              <div className="rating-grid">
                <p><strong>Location:</strong> {land.locationRating} / 5</p>
                <p><strong>Nearby Construction:</strong> {land.nearbyConstructionRating} / 5</p>
                <p><strong>Accessibilities:</strong> {land.accessibilityRating} / 5</p>
                <p><strong>Road Health:</strong> {land.roadHealthRating} / 5</p>
                <p><strong>Crime Rate:</strong> {land.crimeRateRating} / 5</p>
              </div>
            </div>
          )}

          <div className="land-details-section">
  <h3>Location</h3>
  <p>
    {land.location.address}, {land.location.upazila}, {land.location.district},{" "}
    {land.location.division}
  </p>

  {land.location.formattedAddress && (
    <p className="formatted-location-text">
      <strong>Map Address:</strong> {land.location.formattedAddress}
    </p>
  )}

  {hasMapLocation ? (
    <div className="land-map-wrapper">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="land-details-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <strong>{land.title}</strong>
            <br />
            {land.location.formattedAddress || land.location.address}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  ) : (
    <p className="map-unavailable-text">
      Map location is not available for this land post.
    </p>
  )}
</div>

<div className="land-details-section">
  <h3>Current Weather</h3>

  {weatherLoading && (
    <p className="weather-info-text">Loading weather information...</p>
  )}

  {weatherError && (
    <p className="error-message weather-info-text">{weatherError}</p>
  )}

  {!weatherLoading && !weatherError && weather && (
    <div className="weather-card">
      <div className="weather-grid">
        <div className="weather-box">
          <span>Condition</span>
          <strong>{getWeatherLabel(weather.weather_code)}</strong>
        </div>

        <div className="weather-box">
          <span>Temperature</span>
          <strong>{weather.temperature_2m}°C</strong>
        </div>

        <div className="weather-box">
          <span>Humidity</span>
          <strong>{weather.relative_humidity_2m}%</strong>
        </div>

        <div className="weather-box">
          <span>Wind Speed</span>
          <strong>{weather.wind_speed_10m} km/h</strong>
        </div>
      </div>
    </div>
  )}

  {!weatherLoading && !weatherError && !weather && (
    <p className="weather-info-text">
      Weather data is not available for this location.
    </p>
  )}
</div>

          {hasMapLocation && (
            <NearbyPlaces latitude={latitude} longitude={longitude} />
          )}

          {land.preview3D?.enabled && (
            <div className="land-details-section">
              <Building3DPreview
                preview3D={{
                  ...land.preview3D,
                  plotArea: land.landSizeSqft
                }}
              />
            </div>
          )}


          {land.nearbyLandmark && (
            <div className="land-details-section">
              <h3>Nearby Landmark</h3>
              <p>{land.nearbyLandmark}</p>
            </div>
          )}

          <div className="land-details-section">
            <h3>Seller Information</h3>
            <p>
              <strong>Name:</strong> {land.sellerFirstName} {land.sellerLastName}
            </p>
            <p>
              <strong>Email:</strong> {land.sellerEmail}
            </p>
            <p>
              <strong>Phone:</strong> {land.sellerPhone}
            </p>
            <p>
              <strong>Posted:</strong> {new Date(land.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="buy-request-card">
          <h2>Request to Buy</h2>
          <p>
            Interested in this land? Send your details and offer to the seller.
          </p>

          <form onSubmit={handleBuyRequestSubmit} className="buy-request-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                name="buyerFirstName"
                value={formData.buyerFirstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                name="buyerLastName"
                value={formData.buyerLastName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="buyerEmail"
                type="email"
                value={formData.buyerEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="buyerPhone"
                value={formData.buyerPhone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-group">
              <label>Offered Price</label>
              <input
                name="offeredPrice"
                type="number"
                value={formData.offeredPrice}
                onChange={handleChange}
                placeholder="Enter your offer"
                required
              />
            </div>

            <div className="form-group">
              <label>Purpose</label>
              <input
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Ex: Residential / Investment / Commercial"
              />
            </div>

            <div className="form-group">
              <label>Preferred Contact Method</label>
              <select
                name="preferredContactMethod"
                value={formData.preferredContactMethod}
                onChange={handleChange}
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your interest, questions, or proposed next step"
                rows="5"
                required
              />
            </div>

            {requestMessage && <p className="success-message">{requestMessage}</p>}
            {requestError && <p className="error-message">{requestError}</p>}

              <button type="submit" className="request-submit-btn">
                Submit Buy Request
              </button>

                {storedUser?.role === "user" && (
                  <button
                    type="button"
                    className="chat-seller-btn"
                    onClick={handleChatWithSeller}
                  >
                    Chat with Seller
                  </button>
                )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LandDetails;