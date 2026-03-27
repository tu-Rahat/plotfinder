import { useEffect, useState } from "react";

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
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ marginBottom: "10px" }}>Browse Lands</h1>
      <p style={{ marginBottom: "30px", color: "#555" }}>
        Only admin-approved land posts are visible here.
      </p>

      {loading && <p>Loading approved land posts...</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {!loading && lands.length === 0 && <p>No approved lands available yet.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {lands.map((land) => (
          <div
            key={land._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              background: "#fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{land.title}</h3>
            <p style={{ marginBottom: "10px", color: "#444" }}>{land.description}</p>

            <p><strong>Type:</strong> {land.landType}</p>
            <p><strong>Price:</strong> ৳ {land.price}</p>
            <p><strong>Size:</strong> {land.landSizeSqft} sqft</p>
            <p>
              <strong>Location:</strong> {land.location.address}, {land.location.upazila},{" "}
              {land.location.district}, {land.location.division}
            </p>

            {land.ownershipType && (
              <p><strong>Ownership:</strong> {land.ownershipType}</p>
            )}

            {land.roadAccess && (
              <p><strong>Road Access:</strong> {land.roadAccess}</p>
            )}

            {land.nearbyLandmark && (
              <p><strong>Nearby Landmark:</strong> {land.nearbyLandmark}</p>
            )}

            <p><strong>Negotiable:</strong> {land.priceNegotiable ? "Yes" : "No"}</p>
            <p><strong>Seller:</strong> {land.sellerFirstName} {land.sellerLastName}</p>
            <p><strong>Email:</strong> {land.sellerEmail}</p>
            <p><strong>Phone:</strong> {land.sellerPhone}</p>
            <p><strong>Posted:</strong> {new Date(land.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrowseLands;