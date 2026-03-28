import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";
const maxRating = 5;
const ratingKeys = [
  "location",
  "nearbyConstructions",
  "dailyAccessibilities",
  "roadHealth",
  "crimeRate",
];
const defaultFormRatings = {
  location: 5,
  nearbyConstructions: 5,
  dailyAccessibilities: 5,
  roadHealth: 5,
  crimeRate: 5,
};

function Home() {
  const [properties, setProperties] = useState([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [ratingsForm, setRatingsForm] = useState({});
  const [submitMessageById, setSubmitMessageById] = useState({});
  const [submittingById, setSubmittingById] = useState({});

  const token = useMemo(() => localStorage.getItem("token"), []);

  const ratingLabels = {
    location: "Location",
    nearbyConstructions: "Nearby Constructions",
    dailyAccessibilities: "Daily Accessibilities",
    roadHealth: "Road Health",
    crimeRate: "Crime Rate",
  };

  const fetchProperties = async () => {
    try {
      setIsLoadingProperties(true);
      setLoadError("");

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_BASE_URL}/api/properties`, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load properties");
      }

      setProperties(data.properties || []);

      const nextForm = {};
      (data.properties || []).forEach((property) => {
        nextForm[property._id] = property.userRatings
          ? { ...property.userRatings }
          : { ...defaultFormRatings };
      });
      setRatingsForm(nextForm);
    } catch (error) {
      setLoadError(error.message || "Unable to load properties");
    } finally {
      setIsLoadingProperties(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRatingChange = (propertyId, key, value) => {
    setRatingsForm((prev) => ({
      ...prev,
      [propertyId]: {
        ...(prev[propertyId] || defaultFormRatings),
        [key]: Number(value),
      },
    }));
  };

  const handleRateSubmit = async (propertyId) => {
    if (!token) {
      setSubmitMessageById((prev) => ({
        ...prev,
        [propertyId]: "Please login to submit your rating.",
      }));
      return;
    }

    const ratings = ratingsForm[propertyId];
    if (!ratings) {
      return;
    }

    try {
      setSubmittingById((prev) => ({ ...prev, [propertyId]: true }));
      setSubmitMessageById((prev) => ({ ...prev, [propertyId]: "" }));

      const response = await fetch(
        `${API_BASE_URL}/api/properties/${propertyId}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ratings }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit rating");
      }

      setSubmitMessageById((prev) => ({
        ...prev,
        [propertyId]: "Rating saved successfully.",
      }));

      await fetchProperties();
    } catch (error) {
      setSubmitMessageById((prev) => ({
        ...prev,
        [propertyId]: error.message || "Failed to submit rating",
      }));
    } finally {
      setSubmittingById((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Land</h1>
          <p>
            Discover and purchase land properties across the country. From
            residential lots to expansive farmland, find your ideal investment.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Browse Properties</button>
            <button className="secondary-btn">List Your Land</button>
          </div>
        </div>
      </section>

      <section className="why-choose">
        <h2>Why Choose LandMarket?</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon green">📍</div>
            <h3>Wide Selection</h3>
            <p>
              Access thousands of land listings across all regions. Find the
              perfect location for your needs.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon blue">🛡️</div>
            <h3>Secure Transactions</h3>
            <p>
              All transactions are protected with industry-leading security
              measures and trusted escrow services.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon purple">👥</div>
            <h3>Expert Support</h3>
            <p>
              Our team of real estate professionals is here to guide you through
              every step of the process.
            </p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Properties</h2>
          <button className="view-all-btn">View All</button>
        </div>

        {isLoadingProperties && (
          <p className="property-feedback">Loading properties...</p>
        )}
        {!isLoadingProperties && loadError && (
          <p className="property-feedback property-feedback-error">{loadError}</p>
        )}

        {!isLoadingProperties && !loadError && (
          <>
            {properties.length === 0 && (
              <p className="property-feedback">
                No properties found yet. Add properties from backend to enable
                ratings.
              </p>
            )}
            <div className="property-grid">
              {properties.map((property) => (
              <div className="property-card" key={property._id}>
              <div className="property-image-wrapper">
                <img
                  src={property.image}
                  alt={property.title}
                  className="property-image"
                />
                <span className="property-tag">{property.tag}</span>
              </div>

              <div className="property-content">
                <h3>{property.title}</h3>
                <p className="property-location">📍 {property.location}</p>

                <div className="property-meta">
                  <span className="property-price">{property.price}</span>
                  <span className="property-acres">{property.acres}</span>
                </div>

                <div className="property-overall-rating">
                  <span className="rating-stars">⭐</span>
                  <span className="rating-value">
                    {property.overallRating?.toFixed(1) || "0.0"}/{maxRating}
                  </span>
                  <span className="rating-text">
                    Overall Property Score ({property.totalRatings || 0} reviews)
                  </span>
                </div>

                <div className="property-rating-breakdown">
                  {ratingKeys.map((key) => (
                    <div key={key} className="rating-row">
                      <span className="rating-label">{ratingLabels[key]}</span>
                      <span className="rating-row-value">
                        {(property.averageRatings?.[key] || 0).toFixed(1)}/{maxRating}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rating-form">
                  <h4>Rate this property</h4>
                  {ratingKeys.map((key) => (
                    <label key={key} className="rating-input-row">
                      <span>{ratingLabels[key]}</span>
                      <select
                        value={ratingsForm[property._id]?.[key] || 5}
                        onChange={(event) =>
                          handleRatingChange(property._id, key, event.target.value)
                        }
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </label>
                  ))}

                  <button
                    className="rate-submit-btn"
                    onClick={() => handleRateSubmit(property._id)}
                    disabled={Boolean(submittingById[property._id])}
                  >
                    {submittingById[property._id] ? "Saving..." : "Submit Rating"}
                  </button>

                  {!token && (
                    <p className="rate-hint">
                      <Link to="/login">Login</Link> to submit your ratings.
                    </p>
                  )}
                  {submitMessageById[property._id] && (
                    <p className="rate-hint">{submitMessageById[property._id]}</p>
                  )}
                </div>

                <div className="property-features">
                  {(property.features || []).map((feature, index) => (
                    <span key={index} className="feature-pill">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div>
            <h3>5000+</h3>
            <p>Active Listings</p>
          </div>
          <div>
            <h3>12000+</h3>
            <p>Happy Buyers</p>
          </div>
          <div>
            <h3>50</h3>
            <p>States Covered</p>
          </div>
          <div>
            <h3>$2B+</h3>
            <p>Land Sold</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Find Your Land?</h2>
        <p>
          Join thousands of satisfied customers who found their perfect
          property through LandMarket.
        </p>
        <button className="cta-btn">Get Started Today</button>
      </section>
    </div>
  );
}

export default Home;