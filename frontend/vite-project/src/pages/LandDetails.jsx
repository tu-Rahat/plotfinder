import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./LandDetails.css";

function LandDetails() {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lands/${id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load land details");
        }

        setLand(data);
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

          <div className="land-details-section">
            <h3>Location</h3>
            <p>
              {land.location.address}, {land.location.upazila}, {land.location.district},{" "}
              {land.location.division}
            </p>
          </div>

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
          </form>
        </div>
      </div>
    </div>
  );
}

export default LandDetails;