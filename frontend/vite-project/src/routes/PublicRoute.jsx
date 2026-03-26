import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If already logged in → redirect to dashboard
  if (token) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default PublicRoute;