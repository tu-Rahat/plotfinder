import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // If not logged in → redirect to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;