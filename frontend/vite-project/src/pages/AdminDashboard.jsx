import { useEffect, useState } from "react";

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
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1>Admin Dashboard</h1>
      <p style={{ marginBottom: "20px", color: "#555" }}>
        Review pending land posts and approve them.
      </p>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {loading && <p>Loading pending posts...</p>}
      {!loading && pendingPosts.length === 0 && <p>No pending land posts right now.</p>}

      <div style={{ display: "grid", gap: "18px" }}>
        {pendingPosts.map((post) => (
          <div
            key={post._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "20px",
              background: "#fff",
            }}
          >
            <h3>{post.title}</h3>
            <p>{post.description}</p>

            <p><strong>Seller:</strong> {post.sellerFirstName} {post.sellerLastName}</p>
            <p><strong>Email:</strong> {post.sellerEmail}</p>
            <p><strong>Phone:</strong> {post.sellerPhone}</p>
            <p><strong>Type:</strong> {post.landType}</p>
            <p><strong>Price:</strong> ৳ {post.price}</p>
            <p><strong>Size:</strong> {post.landSizeSqft} sqft</p>
            <p>
              <strong>Location:</strong> {post.location.address}, {post.location.upazila},{" "}
              {post.location.district}, {post.location.division}
            </p>

            {post.ownershipType && <p><strong>Ownership:</strong> {post.ownershipType}</p>}
            {post.roadAccess && <p><strong>Road Access:</strong> {post.roadAccess}</p>}
            {post.nearbyLandmark && <p><strong>Nearby Landmark:</strong> {post.nearbyLandmark}</p>}

            <p><strong>Posted:</strong> {new Date(post.createdAt).toLocaleString()}</p>

            <button onClick={() => handleApprove(post._id)}>Approve Post</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;