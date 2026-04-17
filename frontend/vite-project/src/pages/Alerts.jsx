import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Alerts.css";

function Alerts() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    division: "",
    district: "",
    upazila: "",
    landType: "",
    maxPrice: "",
  });

  const fetchPreferences = async () => {
    try {
      setLoadingPreferences(true);

      const response = await fetch("http://localhost:5000/api/notifications/preferences/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch preferences");
      }

      setPreferences(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await fetch("http://localhost:5000/api/notifications/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch notifications");
      }

      setNotifications(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
    fetchNotifications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatePreference = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/notifications/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          division: formData.division,
          district: formData.district,
          upazila: formData.upazila,
          landType: formData.landType,
          maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save preference");
      }

      setSuccessMessage("Preferred location saved successfully.");
      setFormData({
        division: "",
        district: "",
        upazila: "",
        landType: "",
        maxPrice: "",
      });
      fetchPreferences();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleDeletePreference = async (preferenceId) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/preferences/${preferenceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete preference");
      }

      setSuccessMessage(data.message);
      setPreferences((prev) => prev.filter((item) => item._id !== preferenceId));
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark notification as read");
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item
        )
      );
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleOpenLand = (landId, notificationId, isRead) => {
    if (!isRead) {
      handleMarkAsRead(notificationId);
    }

    navigate(`/lands/${landId}`);
  };

  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <h1>Location Alerts</h1>
        <p>
          Save preferred locations and get notified when new approved land is posted there.
        </p>
      </div>

      {(successMessage || errorMessage) && (
        <div className="alerts-feedback">
          {successMessage && <p className="success-message">{successMessage}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      )}

      <div className="alerts-layout">
        <div className="alerts-card">
          <h2>Add Preferred Location</h2>

          <form className="alerts-form" onSubmit={handleCreatePreference}>
            <div className="form-group">
              <label>Division</label>
              <input
                name="division"
                value={formData.division}
                onChange={handleChange}
                placeholder="Ex: Dhaka"
                required
              />
            </div>

            <div className="form-group">
              <label>District</label>
              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Ex: Dhaka"
                required
              />
            </div>

            <div className="form-group">
              <label>Upazila (optional)</label>
              <input
                name="upazila"
                value={formData.upazila}
                onChange={handleChange}
                placeholder="Ex: Mirpur"
              />
            </div>

            <div className="form-group">
              <label>Land Type (optional)</label>
              <input
                name="landType"
                value={formData.landType}
                onChange={handleChange}
                placeholder="Ex: Residential"
              />
            </div>

            <div className="form-group">
              <label>Max Price (optional)</label>
              <input
                type="number"
                name="maxPrice"
                value={formData.maxPrice}
                onChange={handleChange}
                placeholder="Ex: 5000000"
              />
            </div>

            <button type="submit" className="alerts-submit-btn">
              Save Preference
            </button>
          </form>
        </div>

        <div className="alerts-card">
          <h2>My Preferred Locations</h2>

          {loadingPreferences && <p className="alerts-info">Loading preferences...</p>}
          {!loadingPreferences && preferences.length === 0 && (
            <p className="alerts-info">No preferred locations saved yet.</p>
          )}

          <div className="alerts-list">
            {preferences.map((preference) => (
              <div className="alerts-item" key={preference._id}>
                <div>
                  <h3>
                    {preference.upazila
                      ? `${preference.upazila}, ${preference.district}, ${preference.division}`
                      : `${preference.district}, ${preference.division}`}
                  </h3>
                  <p>
                    <strong>Land Type:</strong> {preference.landType || "Any"}
                  </p>
                  <p>
                    <strong>Max Price:</strong>{" "}
                    {preference.maxPrice
                      ? `৳ ${Number(preference.maxPrice).toLocaleString()}`
                      : "Any"}
                  </p>
                </div>

                <button
                  type="button"
                  className="alerts-delete-btn"
                  onClick={() => handleDeletePreference(preference._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="alerts-card notifications-card">
        <h2>My Notifications</h2>

        {loadingNotifications && <p className="alerts-info">Loading notifications...</p>}
        {!loadingNotifications && notifications.length === 0 && (
          <p className="alerts-info">No notifications yet.</p>
        )}

        <div className="alerts-list">
          {notifications.map((notification) => (
            <div
              className={`alerts-item notification-item ${
                notification.isRead ? "read" : "unread"
              }`}
              key={notification._id}
            >
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <p className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="notification-actions">
                <button
                  type="button"
                  className="alerts-open-btn"
                  onClick={() =>
                    handleOpenLand(
                      notification.landId?._id,
                      notification._id,
                      notification.isRead
                    )
                  }
                >
                  View Land
                </button>

                {!notification.isRead && (
                  <button
                    type="button"
                    className="alerts-mark-btn"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Alerts;