import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("http://localhost:5000/api/lands/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch land posts");
      }

      setAllPosts(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
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
      fetchAllPosts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleReject = async (id) => {
    setMessage("");
    setErrorMessage("");

    const rejectionReason = window.prompt("Enter rejection reason (optional):", "");

    if (rejectionReason === null) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectionReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject post");
      }

      setMessage(data.message);
      fetchAllPosts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    setErrorMessage("");

    const confirmed = window.confirm("Are you sure you want to delete this land post?");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }

      setMessage(data.message);
      fetchAllPosts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const pendingPosts = allPosts.filter((post) => post.status === "pending");
  const approvedPosts = allPosts.filter((post) => post.status === "approved");
  const rejectedPosts = allPosts.filter((post) => post.status === "rejected");

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <div>
          <span className="admin-badge">Admin Panel</span>
          <h1>Manage Land Posts</h1>
          <p>
            Review submitted land listings, approve valid posts, reject unsuitable
            ones, or delete unwanted listings from the platform.
          </p>
        </div>

        <div className="admin-summary-card">
          <h3>Review Summary</h3>
          <p>
            <strong>{pendingPosts.length}</strong> pending post
            {pendingPosts.length !== 1 ? "s" : ""}
          </p>
          <p>
            <strong>{approvedPosts.length}</strong> approved post
            {approvedPosts.length !== 1 ? "s" : ""}
          </p>
          <p>
            <strong>{rejectedPosts.length}</strong> rejected post
            {rejectedPosts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {message && <p className="admin-success-message">{message}</p>}
      {errorMessage && <p className="admin-error-message">{errorMessage}</p>}
      {loading && <p className="admin-info-message">Loading land posts...</p>}

      {!loading && (
        <>
          <AdminSection
            title="Pending Land Posts"
            posts={pendingPosts}
            emptyMessage="No pending land posts right now."
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
          />

          <AdminSection
            title="Approved Land Posts"
            posts={approvedPosts}
            emptyMessage="No approved land posts right now."
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
          />

          <AdminSection
            title="Rejected Land Posts"
            posts={rejectedPosts}
            emptyMessage="No rejected land posts right now."
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}

function AdminSection({
  title,
  posts,
  emptyMessage,
  handleApprove,
  handleReject,
  handleDelete,
}) {
  return (
    <div className="admin-section-wrapper">
      <h2 className="admin-section-title">{title}</h2>

      {posts.length === 0 ? (
        <p className="admin-info-message">{emptyMessage}</p>
      ) : (
        <div className="admin-posts-grid">
          {posts.map((post) => (
            <div className="admin-post-card" key={post._id}>
              <div className="admin-post-top">
                <div>
                  <span className="admin-status-badge">
                    {post.status === "pending"
                      ? "Pending Review"
                      : post.status === "approved"
                      ? "Approved"
                      : "Rejected"}
                  </span>
                  <h3>{post.title}</h3>
                </div>
                <p className="admin-post-price">
                  ৳ {Number(post.price).toLocaleString()}
                </p>
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
                  {post.location.address}, {post.location.upazila},{" "}
                  {post.location.district}, {post.location.division}
                </p>
              </div>

              {post.nearbyLandmark && (
                <div className="admin-section">
                  <h4>Nearby Landmark</h4>
                  <p>{post.nearbyLandmark}</p>
                </div>
              )}

              {post.rejectionReason && (
                <div className="admin-section">
                  <h4>Rejection Reason</h4>
                  <p>{post.rejectionReason}</p>
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

              <div className="admin-action-buttons">
                {post.status !== "approved" && (
                  <button
                    className="approve-post-btn"
                    onClick={() => handleApprove(post._id)}
                  >
                    Approve
                  </button>
                )}

                <button
                  className="reject-post-btn"
                  onClick={() => handleReject(post._id)}
                >
                  Reject
                </button>

                <button
                  className="delete-post-btn"
                  onClick={() => handleDelete(post._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;