import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/lands/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pending posts");
      }

      setPendingPosts(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (id) => {
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${id}/approve`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve post");
      }

      setMessage(data.message);
      setPendingPosts((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <div>
          <span className="admin-badge">Admin Panel</span>
          <h1>Pending Land Posts</h1>
          <p>
            Review submitted land listings, verify seller-provided information,
            and approve posts before they become visible on the public website.
          </p>
        </div>

        <div className="admin-summary-card">
          <h3>Review Summary</h3>
          <p>
            <strong>{pendingPosts.length}</strong> pending post
            {pendingPosts.length !== 1 ? "s" : ""}
          </p>
          <p>Approve only verified and appropriate listings.</p>
        </div>
      </div>

      {message && <p className="admin-success-message">{message}</p>}
      {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
      {loading && <p className="admin-info-message">Loading pending posts...</p>}
      {!loading && pendingPosts.length === 0 && (
        <p className="admin-info-message">No pending land posts right now.</p>
      )}

      <div className="admin-posts-grid">
        {pendingPosts.map((post) => (
          <div className="admin-post-card" key={post._id}>
            <div className="admin-post-top">
              <div>
                <span className="admin-status-badge">Pending Review</span>
                <h3>{post.title}</h3>
              </div>
              <p className="admin-post-price">৳ {Number(post.price).toLocaleString()}</p>
            </div>

            <p className="admin-post-description">{post.description}</p>

            <div className="admin-post-grid">
              <div className="admin-info-box">
                <span>Land Type</span>
                <strong>{post.landType}</strong>
              </div>
              <div className="admin-info-box">
                <span>Size</span>
                <strong>{post.landSizeSqft} sqft</strong>
              </div>
              <div className="admin-info-box">
                <span>Ownership</span>
                <strong>{post.ownershipType || "Not specified"}</strong>
              </div>
              <div className="admin-info-box">
                <span>Road Access</span>
                <strong>{post.roadAccess || "Not specified"}</strong>
              </div>
            </div>

            <div className="admin-section">
              <h4>Location</h4>
              <p>
                {post.location.address}, {post.location.upazila}, {post.location.district},{" "}
                {post.location.division}
              </p>
            </div>

            {post.nearbyLandmark && (
              <div className="admin-section">
                <h4>Nearby Landmark</h4>
                <p>{post.nearbyLandmark}</p>
              </div>
            )}

            <div className="admin-seller-box">
              <h4>Seller Information</h4>
              <p>
                <strong>Name:</strong> {post.sellerFirstName} {post.sellerLastName}
              </p>
              <p>
                <strong>Email:</strong> {post.sellerEmail}
              </p>
              <p>
                <strong>Phone:</strong> {post.sellerPhone}
              </p>
              <p>
                <strong>Posted:</strong> {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              className="approve-post-btn"
              onClick={() => handleApprove(post._id)}
            >
              Approve Post
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;