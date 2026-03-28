import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function AdminDashboard() {
  const token = useMemo(() => localStorage.getItem("token"), []);
  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: "",
    acres: "",
    tag: "",
    image: "",
    featuresText: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdList, setCreatedList] = useState([]);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Reset messages when switching roles/logins.
    setMessage("");
    setCreatedList([]);
  }, [isAdmin]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please login as admin to add properties.");
      return;
    }
    if (!isAdmin) {
      setMessage("Admin only. Your account does not have permission.");
      return;
    }

    const features = formData.featuresText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          location: formData.location,
          price: formData.price,
          acres: formData.acres,
          tag: formData.tag,
          image: formData.image,
          features,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create property");
      }

      setMessage("Property added successfully.");
      setCreatedList((prev) => [data.property, ...prev].slice(0, 5));
      setFormData({
        title: "",
        location: "",
        price: "",
        acres: "",
        tag: "",
        image: "",
        featuresText: "",
      });
    } catch (error) {
      setMessage(error.message || "Failed to create property");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>Add Property (Admin)</h2>

        {!token && (
          <p className="admin-hint">
            Please <Link to="/login">login</Link> as admin.
          </p>
        )}

        {token && !isAdmin && (
          <p className="admin-hint admin-hint-error">
            You are logged in, but your account is not admin.
          </p>
        )}

        <label className="admin-input-row">
          <span>Title</span>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-input-row">
          <span>Location</span>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-input-row">
          <span>Price</span>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-input-row">
          <span>Acres</span>
          <input
            name="acres"
            value={formData.acres}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-input-row">
          <span>Tag</span>
          <input
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-input-row">
          <span>Image URL</span>
          <input
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
          />
        </label>

        <label className="admin-input-row">
          <span>Features (comma separated)</span>
          <textarea
            name="featuresText"
            value={formData.featuresText}
            onChange={handleChange}
            rows={3}
          />
        </label>

        <button className="admin-submit-btn" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Property"}
        </button>

        {message && <p className="admin-hint">{message}</p>}

        {createdList.length > 0 && (
          <div className="admin-created">
            <h3>Recently added</h3>
            {createdList.map((p) => (
              <div key={p._id} className="admin-created-item">
                <strong>{p.title}</strong>
                <span className="admin-created-sub">
                  {p.location} - {p.price}
                </span>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default AdminDashboard;