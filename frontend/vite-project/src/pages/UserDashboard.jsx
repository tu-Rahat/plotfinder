import { useEffect, useState } from "react";

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
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);

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

  useEffect(() => {
    fetchMyPosts();
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
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}>
      <h1>User Dashboard</h1>
      <p style={{ marginBottom: "20px", color: "#555" }}>
        Create a land post for selling. Your post will stay pending until admin approves it.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "14px",
          background: "#fff",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          marginBottom: "40px",
        }}
      >
        <h2>Create Post for Selling Land</h2>

        <input name="title" placeholder="Land title" value={formData.title} onChange={handleChange} required />
        <textarea
          name="description"
          placeholder="Describe the land"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
        />

        <select name="landType" value={formData.landType} onChange={handleChange}>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Agricultural">Agricultural</option>
          <option value="Industrial">Industrial</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="landSizeSqft"
          placeholder="Land size in square feet"
          value={formData.landSizeSqft}
          onChange={handleChange}
          required
        />

        <input name="division" placeholder="Division" value={formData.division} onChange={handleChange} required />
        <input name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
        <input name="upazila" placeholder="Upazila" value={formData.upazila} onChange={handleChange} required />
        <input name="address" placeholder="Full address" value={formData.address} onChange={handleChange} required />

        <input
          name="ownershipType"
          placeholder="Ownership type (optional)"
          value={formData.ownershipType}
          onChange={handleChange}
        />

        <input
          name="roadAccess"
          placeholder="Road access (optional)"
          value={formData.roadAccess}
          onChange={handleChange}
        />

        <input
          name="nearbyLandmark"
          placeholder="Nearby landmark (optional)"
          value={formData.nearbyLandmark}
          onChange={handleChange}
        />

        <input
          name="sellerPhone"
          placeholder="Phone number"
          value={formData.sellerPhone}
          onChange={handleChange}
          required
        />

        <label>
          <input
            type="checkbox"
            name="priceNegotiable"
            checked={formData.priceNegotiable}
            onChange={handleChange}
          />{" "}
          Price negotiable
        </label>

        <div>
          <p><strong>Seller Email:</strong> {storedUser?.email}</p>
          <p><strong>Seller Name:</strong> {storedUser?.firstName} {storedUser?.lastName}</p>
        </div>

        <button type="submit">Submit Land Post</button>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </form>

      <div>
        <h2>My Land Posts</h2>

        {loadingPosts && <p>Loading your posts...</p>}
        {!loadingPosts && myPosts.length === 0 && <p>You have not submitted any land posts yet.</p>}

        <div style={{ display: "grid", gap: "16px" }}>
          {myPosts.map((post) => (
            <div
              key={post._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "18px",
                background: "#fff",
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <p><strong>Status:</strong> {post.status}</p>
              <p><strong>Price:</strong> ৳ {post.price}</p>
              <p><strong>Size:</strong> {post.landSizeSqft} sqft</p>
              <p>
                <strong>Location:</strong> {post.location.address}, {post.location.upazila},{" "}
                {post.location.district}, {post.location.division}
              </p>
              <p><strong>Posted:</strong> {new Date(post.createdAt).toLocaleString()}</p>
              {post.approvedAt && (
                <p><strong>Approved At:</strong> {new Date(post.approvedAt).toLocaleString()}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;