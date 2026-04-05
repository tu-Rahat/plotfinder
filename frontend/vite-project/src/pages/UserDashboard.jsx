import { useEffect, useState } from "react";
import "./UserDashboard.css";

function UserDashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const initialFormData = {
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
    latitude: "",
    longitude: "",
    formattedAddress: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  const [myPosts, setMyPosts] = useState([]);
  const [myBuyRequests, setMyBuyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingIncomingRequests, setLoadingIncomingRequests] = useState(true);
  const [myShortlist, setMyShortlist] = useState([]);
  const [loadingShortlist, setLoadingShortlist] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState(initialFormData);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [locationSearchError, setLocationSearchError] = useState("");
  const [editLocationQuery, setEditLocationQuery] = useState("");
  const [editLocationLoading, setEditLocationLoading] = useState(false);
  const [editLocationResults, setEditLocationResults] = useState([]);
  const [editLocationSearchError, setEditLocationSearchError] = useState("");



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

  const fetchMyShortlist = async () => {
    try {
      setLoadingShortlist(true);

      const response = await fetch("http://localhost:5000/api/shortlist/my-shortlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch shortlist");
      }

      setMyShortlist(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingShortlist(false);
    }
  };

  const handleRemoveFromShortlist = async (landId) => {
    try {
      setMessage("");
      setErrorMessage("");

      const response = await fetch(`http://localhost:5000/api/shortlist/${landId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from shortlist");
      }

      setMyShortlist((prev) => prev.filter((item) => item.landId?._id !== landId));
      setMessage(data.message);
    } catch (error) {
      setErrorMessage(error.message);
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
    fetchMyShortlist();
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
      setFormData(initialFormData);
      fetchMyPosts();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setEditFormData({
      title: post.title || "",
      description: post.description || "",
      landType: post.landType || "Residential",
      price: post.price || "",
      landSizeSqft: post.landSizeSqft || "",
      division: post.location?.division || "",
      district: post.location?.district || "",
      upazila: post.location?.upazila || "",
      address: post.location?.address || "",
      ownershipType: post.ownershipType || "",
      roadAccess: post.roadAccess || "",
      nearbyLandmark: post.nearbyLandmark || "",
      sellerPhone: post.sellerPhone || storedUser?.phone || "",
      priceNegotiable: post.priceNegotiable || false,
      latitude: post.location?.latitude || "",
      longitude: post.location?.longitude || "",
      formattedAddress: post.location?.formattedAddress || "",

    });
    setEditLocationQuery(post.location?.formattedAddress || post.location?.address || "");
    setEditLocationResults([]);
    setEditLocationSearchError("");
  };

  const closeEditModal = () => {
    setEditLocationQuery("");
    setEditLocationResults([]);
    setEditLocationSearchError("");
    setEditingPost(null);
    setEditFormData(initialFormData);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setSubmittingEdit(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/lands/my-posts/${editingPost._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editFormData,
            sellerPhone: editFormData.sellerPhone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update your land post");
      }

      setMessage(data.message);
      closeEditModal();
      fetchMyPosts();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeletePost = async (postId) => {
    setMessage("");
    setErrorMessage("");

    const confirmed = window.confirm("Are you sure you want to delete this land post?");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/lands/my-posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete your land post");
      }

      setMessage(data.message);
      setMyPosts((prev) => prev.filter((post) => post._id !== postId));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleLocationSearch = async () => {
  setLocationSearchError("");
  setLocationResults([]);

  if (!locationQuery.trim()) {
    setLocationSearchError("Please enter a location to search.");
    return;
  }

  try {
    setLocationLoading(true);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        locationQuery
      )}&limit=5`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to search location");
    }

    if (!Array.isArray(data) || data.length === 0) {
      setLocationSearchError("No locations found. Try a more specific search.");
      return;
    }

    setLocationResults(data);
  } catch (error) {
    setLocationSearchError(error.message || "Failed to search location");
  } finally {
    setLocationLoading(false);
  }
  };

  const handleEditLocationSearch = async () => {
  setEditLocationSearchError("");
  setEditLocationResults([]);

  if (!editLocationQuery.trim()) {
    setEditLocationSearchError("Please enter a location to search.");
    return;
  }

  try {
    setEditLocationLoading(true);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        editLocationQuery
      )}&limit=5`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to search location");
    }

    if (!Array.isArray(data) || data.length === 0) {
      setEditLocationSearchError("No locations found. Try a more specific search.");
      return;
    }

    setEditLocationResults(data);
  } catch (error) {
    setEditLocationSearchError(error.message || "Failed to search location");
  } finally {
    setEditLocationLoading(false);
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
              <div className="form-group full-width">
      <label>Search Location (External API)</label>
      <div className="location-search-row">
        <input
          type="text"
          placeholder="Search place, area, or full address"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
        />
        <button
          type="button"
          className="location-search-btn"
          onClick={handleLocationSearch}
          disabled={locationLoading}
        >
          {locationLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {locationSearchError && (
        <p className="error-message location-search-message">{locationSearchError}</p>
      )}

      {locationResults.length > 0 && (
        <div className="location-results-list">
          {locationResults.map((item) => (
            <button
              key={item.place_id}
              type="button"
              className="location-result-item"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  address: item.display_name || prev.address,
                  latitude: item.lat || "",
                  longitude: item.lon || "",
                  formattedAddress: item.display_name || "",
                }));
                setLocationQuery(item.display_name || "");
                setLocationResults([]);
                setLocationSearchError("");
              }}
            >
              {item.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
    {formData.latitude && formData.longitude && (
  <div className="form-group full-width">
    <div className="selected-location-preview">
      <h4>Selected Map Location</h4>
      <p>
        <strong>Address:</strong>{" "}
        {formData.formattedAddress || formData.address}
      </p>
      <p>
        <strong>Latitude:</strong> {formData.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {formData.longitude}
      </p>
    </div>
  </div>
)}

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
                {post.rejectionReason && (
                  <p>
                    <strong>Rejection Reason:</strong> {post.rejectionReason}
                  </p>
                )}
              </div>

              <div className="request-action-buttons">
                <button
                  type="button"
                  className="review-btn"
                  onClick={() => openEditModal(post)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="reject-btn"
                  onClick={() => handleDeletePost(post._id)}
                >
                  Delete
                </button>
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

      <div className="my-posts-section">
        <div className="section-heading">
          <h2>My Shortlisted Lands</h2>
          <p>View and manage the lands you saved for later.</p>
        </div>

        {loadingShortlist && (
          <p className="dashboard-info">Loading shortlisted lands...</p>
        )}

        {!loadingShortlist && myShortlist.length === 0 && (
          <p className="dashboard-info">You have not shortlisted any lands yet.</p>
        )}

        <div className="my-posts-grid">
          {myShortlist.map((item) => {
            const land = item.landId;
            if (!land) return null;

            return (
              <div className="my-post-card" key={item._id}>
                <div className="my-post-top">
                  <div>
                    <span className="status-badge status-approved">Shortlisted</span>
                    <h3>{land.title}</h3>
                  </div>
                  <p className="post-price">৳ {Number(land.price).toLocaleString()}</p>
                </div>

                <p className="post-description">
                  {land.description?.slice(0, 120)}...
                </p>

                <div className="post-meta">
                  <p><strong>Type:</strong> {land.landType}</p>
                  <p><strong>Size:</strong> {land.landSizeSqft} sqft</p>
                  <p>
                    <strong>Location:</strong> {land.location?.district}, {land.location?.division}
                  </p>
                </div>

                <div className="request-action-buttons">
                  <button
                    type="button"
                    className="review-btn"
                    onClick={() => (window.location.href = `/lands/${land._id}`)}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className="reject-btn"
                    onClick={() => handleRemoveFromShortlist(land._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingPost && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-edit-modal">
            <div className="dashboard-modal-header">
              <h2>Edit My Land Post</h2>
              <button type="button" className="dashboard-modal-close" onClick={closeEditModal}>
                ×
              </button>
            </div>

            <form className="dashboard-edit-form" onSubmit={handleEditSubmit}>
              <div className="form-section">
                <h2>Basic Information</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Land Title</label>
                    <input
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      name="description"
                      rows="5"
                      value={editFormData.description}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Land Type</label>
                    <select
                      name="landType"
                      value={editFormData.landType}
                      onChange={handleEditChange}
                    >
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
                      value={editFormData.price}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Land Size (sqft)</label>
                    <input
                      type="number"
                      name="landSizeSqft"
                      value={editFormData.landSizeSqft}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="priceNegotiable"
                        checked={editFormData.priceNegotiable}
                        onChange={handleEditChange}
                      />
                      Price negotiable
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Location Details</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
  <label>Search Location (External API)</label>
  <div className="location-search-row">
    <input
      type="text"
      placeholder="Search place, area, or full address"
      value={editLocationQuery}
      onChange={(e) => setEditLocationQuery(e.target.value)}
    />
    <button
      type="button"
      className="location-search-btn"
      onClick={handleEditLocationSearch}
      disabled={editLocationLoading}
    >
      {editLocationLoading ? "Searching..." : "Search"}
    </button>
  </div>

  {editLocationSearchError && (
    <p className="error-message location-search-message">
      {editLocationSearchError}
    </p>
  )}

  {editLocationResults.length > 0 && (
    <div className="location-results-list">
      {editLocationResults.map((item) => (
        <button
          key={item.place_id}
          type="button"
          className="location-result-item"
          onClick={() => {
            setEditFormData((prev) => ({
              ...prev,
              address: item.display_name || prev.address,
              latitude: item.lat || "",
              longitude: item.lon || "",
              formattedAddress: item.display_name || "",
            }));
            setEditLocationQuery(item.display_name || "");
            setEditLocationResults([]);
            setEditLocationSearchError("");
          }}
        >
          {item.display_name}
        </button>
      ))}
    </div>
  )}
</div>

{editFormData.latitude && editFormData.longitude && (
  <div className="form-group full-width">
    <div className="selected-location-preview">
      <h4>Selected Map Location</h4>
      <p>
        <strong>Address:</strong>{" "}
        {editFormData.formattedAddress || editFormData.address}
      </p>
      <p>
        <strong>Latitude:</strong> {editFormData.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {editFormData.longitude}
      </p>
    </div>
  </div>
)}
                  <div className="form-group">
                    <label>Division</label>
                    <input
                      name="division"
                      value={editFormData.division}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>District</label>
                    <input
                      name="district"
                      value={editFormData.district}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Upazila</label>
                    <input
                      name="upazila"
                      value={editFormData.upazila}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Full Address</label>
                    <input
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditChange}
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
                      value={editFormData.ownershipType}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Road Access</label>
                    <input
                      name="roadAccess"
                      value={editFormData.roadAccess}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Nearby Landmark</label>
                    <input
                      name="nearbyLandmark"
                      value={editFormData.nearbyLandmark}
                      onChange={handleEditChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      name="sellerPhone"
                      value={editFormData.sellerPhone}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="dashboard-edit-actions">
                <button type="submit" className="submit-post-btn" disabled={submittingEdit}>
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="cancel-edit-btn"
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

export default UserDashboard;