import { useEffect, useState } from "react";
import "./BrowseLands.css";

function BrowseLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
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
            <div className="land-card-top">
              <div>
                <p className="land-type-badge">{land.landType}</p>
                <h2>{land.title}</h2>
              </div>
              <div className="land-price">
                <span>Price</span>
                <h3>৳ {Number(land.price).toLocaleString()}</h3>
              </div>
            </div>

            <p className="land-description">{land.description}</p>

            <div className="land-highlights">
              <div className="highlight-box">
                <span>Size</span>
                <strong>{land.landSizeSqft} sqft</strong>
              </div>
              <div className="highlight-box">
                <span>Negotiable</span>
                <strong>{land.priceNegotiable ? "Yes" : "No"}</strong>
              </div>
              <div className="highlight-box">
                <span>Ownership</span>
                <strong>{land.ownershipType || "Not specified"}</strong>
              </div>
              <div className="highlight-box">
                <span>Road Access</span>
                <strong>{land.roadAccess || "Not specified"}</strong>
              </div>
            </div>

            <div className="land-section">
              <h4>Location</h4>
              <p>
                {land.location.address}, {land.location.upazila},{" "}
                {land.location.district}, {land.location.division}
              </p>
            </div>

            {land.nearbyLandmark && (
              <div className="land-section">
                <h4>Nearby Landmark</h4>
                <p>{land.nearbyLandmark}</p>
              </div>
            )}

            <div className="land-footer">
              <div className="seller-info">
                <h4>Seller Info</h4>
                <p>
                  <strong>Name:</strong> {land.sellerFirstName} {land.sellerLastName}
                </p>
                <p>
                  <strong>Email:</strong> {land.sellerEmail}
                </p>
                <p>
                  <strong>Phone:</strong> {land.sellerPhone}
                </p>
              </div>

              <div className="posted-info">
                <h4>Posted On</h4>
                <p>{new Date(land.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseLands;