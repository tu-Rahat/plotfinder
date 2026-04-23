import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BrowseLands.css";

function BrowseLands() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [lands, setLands] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const renderStars = (rating) => {
    const value = Math.round(Number(rating) || 0);
    const filled = Math.max(0, Math.min(5, value));
    return "★".repeat(filled) + "☆".repeat(5 - filled);
  };

  useEffect(() => {
    const fetchApprovedLands = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/lands");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch lands");
        }

        setLands(data);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedLands();
  }, []);

  useEffect(() => {
    const fetchMyShortlist = async () => {
      if (!token || !storedUser || storedUser.role !== "user") return;

      try {
        const response = await fetch("http://localhost:5000/api/shortlist/my-shortlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch shortlist");
        }

        const ids = data.map((item) => item.landId?._id).filter(Boolean);
        setShortlistedIds(ids);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchMyShortlist();
  }, [token]);

  const handleShortlist = async (landId) => {
    setActionMessage("");
    setErrorMessage("");

    if (!token || !storedUser || storedUser.role !== "user") {
      setErrorMessage("Please login as a user to shortlist lands.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/shortlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ landId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to shortlist land");
      }

      setShortlistedIds((prev) => [...prev, landId]);
      setActionMessage("Land added to shortlist");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="browse-lands-page">
      <div className="browse-lands-header">
        <span className="browse-badge">Approved Listings</span>
        <h1>Browse Lands</h1>
        <p>
          Discover verified land posts approved by admin. Explore location,
          size, and price, then shortlist the ones you prefer.
        </p>
      </div>

      {actionMessage && <p className="browse-success">{actionMessage}</p>}
      {loading && <p className="browse-message">Loading approved land posts...</p>}
      {errorMessage && <p className="browse-error">{errorMessage}</p>}
      {!loading && lands.length === 0 && (
        <p className="browse-message">No approved lands available yet.</p>
      )}

      <div className="lands-grid">
        {lands.map((land) => {
          const isShortlisted = shortlistedIds.includes(land._id);

          return (
            <div className={`land-card ${land.boostStatus === 'active' ? `boosted-card ${land.boostTier}-tier` : ''}`} key={land._id}>
              <div className="land-card-badges">
                <p className="land-type-badge" style={{ margin: 0 }}>{land.landType}</p>
                {land.boostStatus === 'active' && (
                  <p className={`premium-badge badge-${land.boostTier}`} style={{ margin: 0 }}>
                    {land.boostTier === 'gold' && '⭐⭐⭐ Gold Promoted'}
                    {land.boostTier === 'silver' && '⭐⭐ Silver Promoted'}
                    {land.boostTier === 'bronze' && '⭐ Promoted'}
                  </p>
                )}
              </div>

              <h2>{land.title}</h2>

              <p className="land-price">৳ {Number(land.price).toLocaleString()}</p>

              <p className="land-size">{land.landSizeSqft} sqft</p>

              <p className="land-location">
                {land.location.district}, {land.location.division}
              </p>

              <p className="land-description">
                {land.description.slice(0, 90)}...
              </p>

              {land.overallRating > 0 && (
                <p className="land-rating">
                  <strong>Rating:</strong> {renderStars(land.overallRating)} ({Number(land.overallRating).toFixed(1)})
                </p>
              )}

              <div className="land-card-actions">
                <button
                  className="view-btn"
                  onClick={() => navigate(`/lands/${land._id}`)}
                >
                  View Details
                </button>

                <button
                  type="button"
                  className={`shortlist-btn ${isShortlisted ? "shortlisted" : ""}`}
                  onClick={() => handleShortlist(land._id)}
                  disabled={isShortlisted}
                >
                  {isShortlisted ? "Shortlisted" : "Shortlist"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrowseLands;