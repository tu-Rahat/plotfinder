import { useEffect, useState } from "react";
import "./UserDashboard.css";

function UserDashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    landType: "Residential",
    price: "",
    landSizeSqft: "",
    division: "",
    district: "",
    upazila: "",
    address: "",
    ownershipType: "",
    roadAccess: "",
    nearbyLandmark: "",
    sellerPhone: storedUser?.phone || "",
    priceNegotiable: false,
  });

  const [myPosts, setMyPosts] = useState([]);
  const [myBuyRequests, setMyBuyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingIncomingRequests, setLoadingIncomingRequests] = useState(true);

  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true);

      const response = await fetch("http://localhost:5000/api/lands/my-posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch your land posts");
      }

      setMyPosts(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchMyBuyRequests = async () => {
    try {
      setLoadingRequests(true);

      const response = await fetch("http://localhost:5000/api/buy-requests/my-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch your buy requests");
      }

      setMyBuyRequests(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchIncomingRequests = async () => {
  try {
    setLoadingIncomingRequests(true);

    const response = await fetch("http://localhost:5000/api/buy-requests/incoming", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch incoming requests");
    }

    setIncomingRequests(data);
  } catch (error) {
    setErrorMessage(error.message);
  } finally {
    setLoadingIncomingRequests(false);
  }
};

const handleUpdateRequestStatus = async (requestId, status) => {
  console.log("clicked", requestId, status);
  try {
    setMessage("");
    setErrorMessage("");

    const response = await fetch(
      `http://localhost:5000/api/buy-requests/${requestId}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update request status");
    }

    setIncomingRequests((prev) =>
      prev.map((request) =>
        request._id === requestId ? { ...request, status } : request
      )
    );

    setMessage(data.message);
  } catch (error) {
    setErrorMessage(error.message);
  }
};


  useEffect(() => {
    fetchMyPosts();
    fetchMyBuyRequests();
    fetchIncomingRequests();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        sellerFirstName: storedUser?.firstName || "",
        sellerLastName: storedUser?.lastName || "",
        sellerEmail: storedUser?.email || "",
        sellerPhone: formData.sellerPhone,
      };

      const response = await fetch("http://localhost:5000/api/lands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit land post");
      }

      setMessage(data.message);

      setFormData({
        title: "",
        description: "",
        landType: "Residential",
        price: "",
        landSizeSqft: "",
        division: "",
        district: "",
        upazila: "",
        address: "",
        ownershipType: "",
        roadAccess: "",
        nearbyLandmark: "",
        sellerPhone: storedUser?.phone || "",
        priceNegotiable: false,
      });

      fetchMyPosts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-badge">Seller Dashboard</span>
          <h1>Post Your Land for Sale</h1>
          <p>
            Create a land listing with clear information. Your post will stay pending
            until it is reviewed and approved by admin.
          </p>
        </div>

        <div className="dashboard-user-card">
          <h3>User Info</h3>
          <p>
            <strong>Name:</strong> {storedUser?.firstName} {storedUser?.lastName}
          </p>
          <p>
            <strong>Email:</strong> {storedUser?.email}
          </p>
        </div>
      </div>

      <form className="sell-form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Land Title</label>
              <input
                name="title"
                placeholder="Ex: Premium Residential Plot in Dhaka"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                placeholder="Write a short but useful description of the land"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
              />
            </div>

            <div className="form-group">
              <label>Land Type</label>
              <select name="landType" value={formData.landType} onChange={handleChange}>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Industrial">Industrial</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                placeholder="Enter asking price"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Land Size (sqft)</label>
              <input
                type="number"
                name="landSizeSqft"
                placeholder="Enter land size"
                value={formData.landSizeSqft}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="priceNegotiable"
                  checked={formData.priceNegotiable}
                  onChange={handleChange}
                />
                Price negotiable
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Location Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Division</label>
              <input
                name="division"
                placeholder="Division"
                value={formData.division}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                name="district"
                placeholder="District"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Upazila</label>
              <input
                name="upazila"
                placeholder="Upazila"
                value={formData.upazila}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Full Address</label>
              <input
                name="address"
                placeholder="House/Road/Area details"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Extra Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Ownership Type</label>
              <input
                name="ownershipType"
                placeholder="Ex: Single / Shared"
                value={formData.ownershipType}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Road Access</label>
              <input
                name="roadAccess"
                placeholder="Ex: 20 ft road / Main road"
                value={formData.roadAccess}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Nearby Landmark</label>
              <input
                name="nearbyLandmark"
                placeholder="Ex: School, mosque, market"
                value={formData.nearbyLandmark}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="sellerPhone"
                placeholder="Phone number"
                value={formData.sellerPhone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <div>
            {message && <p className="success-message">{message}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>

          <button type="submit" className="submit-post-btn">
            Submit Land Post
          </button>
        </div>
      </form>

      <div className="my-posts-section">
        <div className="section-heading">
          <h2>My Land Posts</h2>
          <p>Track your submitted listings and approval status.</p>
        </div>

        {loadingPosts && <p className="dashboard-info">Loading your posts...</p>}
        {!loadingPosts && myPosts.length === 0 && (
          <p className="dashboard-info">You have not submitted any land posts yet.</p>
        )}

        <div className="my-posts-grid">
          {myPosts.map((post) => (
            <div className="my-post-card" key={post._id}>
              <div className="my-post-top">
                <div>
                  <span className={`status-badge status-${post.status}`}>
                    {post.status}
                  </span>
                  <h3>{post.title}</h3>
                </div>
                <p className="post-price">৳ {Number(post.price).toLocaleString()}</p>
              </div>

              <p className="post-description">{post.description}</p>

              <div className="post-meta">
                <p><strong>Size:</strong> {post.landSizeSqft} sqft</p>
                <p>
                  <strong>Location:</strong> {post.location.district}, {post.location.division}
                </p>
                <p><strong>Posted:</strong> {new Date(post.createdAt).toLocaleString()}</p>
                {post.approvedAt && (
                  <p>
                    <strong>Approved At:</strong> {new Date(post.approvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="my-posts-section">
        <div className="section-heading">
          <h2>My Buy Requests</h2>
          <p>Track the land requests you have submitted as a buyer.</p>
        </div>

        {loadingRequests && <p className="dashboard-info">Loading your buy requests...</p>}
        {!loadingRequests && myBuyRequests.length === 0 && (
          <p className="dashboard-info">You have not submitted any buy requests yet.</p>
        )}

        <div className="my-posts-grid">
          {myBuyRequests.map((request) => (
            <div className="my-post-card" key={request._id}>
              <div className="my-post-top">
                <div>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status}
                  </span>
                  <h3>{request.landId?.title || "Land unavailable"}</h3>
                </div>
                <p className="post-price">
                  ৳ {Number(request.offeredPrice).toLocaleString()}
                </p>
              </div>

              <p className="post-description">{request.message}</p>

              <div className="post-meta">
                <p>
                  <strong>Land Price:</strong> ৳{" "}
                  {Number(request.landId?.price || 0).toLocaleString()}
                </p>
                <p>
                  <strong>Land Size:</strong> {request.landId?.landSizeSqft || "N/A"} sqft
                </p>
                <p>
                  <strong>Location:</strong>{" "}
                  {request.landId?.location
                    ? `${request.landId.location.district}, ${request.landId.location.division}`
                    : "N/A"}
                </p>
                <p><strong>Purpose:</strong> {request.purpose || "Not specified"}</p>
                <p>
                  <strong>Preferred Contact:</strong> {request.preferredContactMethod}
                </p>
                <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="my-posts-section">
  <div className="section-heading">
    <h2>Incoming Requests for My Lands</h2>
    <p>See buyer interest for your lands</p>
  </div>

  {loadingIncomingRequests && <p>Loading...</p>}

  <div className="my-posts-grid">
    {incomingRequests.map((request) => (
      <div className="my-post-card" key={request._id}>
        <span className={`status-badge status-${request.status}`}>
          {request.status}
        </span>

        <h3>{request.landId?.title}</h3>

        <p><strong>Offer:</strong> ৳ {request.offeredPrice}</p>
        <p><strong>Buyer:</strong> {request.buyerFirstName}</p>
        <p><strong>Phone:</strong> {request.buyerPhone}</p>

        <div className="request-action-buttons">
          <button
            type="button"
            onClick={() => handleUpdateRequestStatus(request._id, "under_review")}
          >
            Review
          </button>

          <button
            type="button"
            onClick={() => handleUpdateRequestStatus(request._id, "accepted")}
          >
            Accept
          </button>

          <button
            type="button"
            onClick={() => handleUpdateRequestStatus(request._id, "rejected")}
          >
            Reject
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  );
}

export default UserDashboard;