import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BrowseLands.css";

function BrowseLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <div className="browse-lands-page">
      <div className="browse-lands-header">
        <span className="browse-badge">Approved Listings</span>
        <h1>Browse Lands</h1>
        <p>
          Discover verified land posts approved by admin. Explore location,
          size, price, and seller information in a cleaner marketplace view.
        </p>
      </div>

      {loading && <p className="browse-message">Loading approved land posts...</p>}
      {errorMessage && <p className="browse-error">{errorMessage}</p>}
      {!loading && lands.length === 0 && (
        <p className="browse-message">No approved lands available yet.</p>
      )}

      <div className="lands-grid">
        {lands.map((land) => (
          <div className="land-card" key={land._id}>
            <p className="land-type-badge">{land.landType}</p>

            <h2>{land.title}</h2>

            <p className="land-price">৳ {Number(land.price).toLocaleString()}</p>

            <p className="land-size">{land.landSizeSqft} sqft</p>

            <p className="land-location">
              {land.location.district}, {land.location.division}
            </p>

            <p className="land-description">
              {land.description.slice(0, 90)}...
            </p>

            <button
              className="view-btn"
              onClick={() => navigate(`/lands/${land._id}`)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseLands;