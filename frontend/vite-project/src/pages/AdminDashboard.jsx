import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    landType: "",
    price: "",
    landSizeSqft: "",
    division: "",
    district: "",
    upazila: "",
    address: "",
    ownershipType: "",
    roadAccess: "",
    nearbyLandmark: "",
    priceNegotiable: false,
  });

  // Payment management state
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(null);

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

  const fetchPendingPayments = async () => {
    try {
      setLoadingPayments(true);
      setErrorMessage("");

      const response = await fetch("http://localhost:5000/api/lands/admin/pending-payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch pending payments");
      }

      setPendingPayments(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchAllPosts();
    fetchPendingPayments();
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

  const handleVerifyPayment = async (postId) => {
    setMessage("");
    setErrorMessage("");
    setVerifyingPayment(postId);

    const notes = window.prompt("Enter verification notes (optional):", "");

    if (notes === null) {
      setVerifyingPayment(null);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${postId}/payment/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify payment");
      }

      setMessage(data.message);
      fetchPendingPayments();
      fetchAllPosts();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setVerifyingPayment(null);
    }
  };

  const handleRejectPayment = async (postId) => {
    setMessage("");
    setErrorMessage("");

    const notes = window.prompt("Enter rejection reason:", "");

    if (!notes || notes.trim() === "") {
      alert("Rejection reason is required");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${postId}/payment/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject payment");
      }

      setMessage(data.message);
      fetchPendingPayments();
      fetchAllPosts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title || "",
      description: post.description || "",
      landType: post.landType || "",
      price: post.price || "",
      landSizeSqft: post.landSizeSqft || "",
      division: post.location?.division || "",
      district: post.location?.district || "",
      upazila: post.location?.upazila || "",
      address: post.location?.address || "",
      ownershipType: post.ownershipType || "",
      roadAccess: post.roadAccess || "",
      nearbyLandmark: post.nearbyLandmark || "",
      priceNegotiable: post.priceNegotiable || false,
    });
  };

  const closeEditModal = () => {
    setEditingPost(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(`http://localhost:5000/api/lands/${editingPost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update post");
      }

      setMessage(data.message);
      setEditingPost(null);
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
            ones, edit listing information, or delete unwanted posts.
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
          <PaymentSection
            title="Pending Payment Verifications"
            posts={pendingPayments}
            loading={loadingPayments}
            emptyMessage="No pending payment verifications."
            handleVerifyPayment={handleVerifyPayment}
            handleRejectPayment={handleRejectPayment}
            verifyingPayment={verifyingPayment}
          />

          <AdminSection
            title="Pending Land Posts"
            posts={pendingPosts}
            emptyMessage="No pending land posts right now."
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
            openEditModal={openEditModal}
          />

          <AdminSection
            title="Approved Land Posts"
            posts={approvedPosts}
            emptyMessage="No approved land posts right now."
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
            openEditModal={openEditModal}
          />

          <AdminSection
            title="Rejected Land Posts"
            posts={rejectedPosts}
            emptyMessage="No rejected land posts right now."
            handleApprove={handleApprove}
            handleReject={handleReject}
            handleDelete={handleDelete}
            openEditModal={openEditModal}
          />
        </>
      )}

      {editingPost && (
        <div className="admin-modal-overlay">
          <div className="admin-edit-modal">
            <div className="admin-edit-modal-header">
              <h2>Edit Land Post</h2>
              <button className="admin-close-btn" onClick={closeEditModal}>
                ×
              </button>
            </div>

            <form className="admin-edit-form" onSubmit={handleEditSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={editForm.description}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="landType"
                placeholder="Land Type"
                value={editForm.landType}
                onChange={handleEditChange}
                required
              />

              <input
                type="number"
                name="price"
                placeholder="Price"
                value={editForm.price}
                onChange={handleEditChange}
                required
              />

              <input
                type="number"
                name="landSizeSqft"
                placeholder="Land Size (sqft)"
                value={editForm.landSizeSqft}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="division"
                placeholder="Division"
                value={editForm.division}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="district"
                placeholder="District"
                value={editForm.district}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="upazila"
                placeholder="Upazila"
                value={editForm.upazila}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={editForm.address}
                onChange={handleEditChange}
                required
              />

              <input
                type="text"
                name="ownershipType"
                placeholder="Ownership Type"
                value={editForm.ownershipType}
                onChange={handleEditChange}
              />

              <input
                type="text"
                name="roadAccess"
                placeholder="Road Access"
                value={editForm.roadAccess}
                onChange={handleEditChange}
              />

              <input
                type="text"
                name="nearbyLandmark"
                placeholder="Nearby Landmark"
                value={editForm.nearbyLandmark}
                onChange={handleEditChange}
              />

              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  name="priceNegotiable"
                  checked={editForm.priceNegotiable}
                  onChange={handleEditChange}
                />
                Price Negotiable
              </label>

              <div className="admin-edit-actions">
                <button type="submit" className="approve-post-btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="delete-post-btn"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
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
  openEditModal,
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
                  className="edit-post-btn"
                  onClick={() => openEditModal(post)}
                >
                  Edit
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

function PaymentSection({
  title,
  posts,
  loading,
  emptyMessage,
  handleVerifyPayment,
  handleRejectPayment,
  verifyingPayment,
}) {
  return (
    <div className="admin-section-wrapper">
      <h2 className="admin-section-title">{title}</h2>

      {loading ? (
        <p className="admin-info-message">Loading payment verifications...</p>
      ) : posts.length === 0 ? (
        <p className="admin-info-message">{emptyMessage}</p>
      ) : (
        <div className="admin-posts-grid">
          {posts.map((post) => (
            <div className="admin-post-card" key={post._id}>
              <div className="admin-post-top">
                <div>
                  <span className="admin-status-badge payment-pending">Payment Pending</span>
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
                  <span>Payment Method</span>
                  <strong>{post.paymentMethod}</strong>
                </div>
                <div className="admin-info-box">
                  <span>Paid Amount</span>
                  <strong>৳ {Number(post.paymentAmount).toLocaleString()}</strong>
                </div>
              </div>

              <div className="admin-section">
                <h4>Payment Details</h4>
                <div className="payment-details-grid">
                  <p><strong>Sender:</strong> {post.paymentSender}</p>
                  <p><strong>Transaction ID:</strong> {post.paymentTransactionId}</p>
                  <p><strong>Amount:</strong> ৳ {Number(post.paymentAmount).toLocaleString()}</p>
                  <p><strong>Method:</strong> {post.paymentMethod}</p>
                </div>
              </div>

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
                <button
                  className="approve-post-btn"
                  onClick={() => handleVerifyPayment(post._id)}
                  disabled={verifyingPayment === post._id}
                >
                  {verifyingPayment === post._id ? "Verifying..." : "Verify Payment"}
                </button>

                <button
                  className="reject-post-btn"
                  onClick={() => handleRejectPayment(post._id)}
                >
                  Reject Payment
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