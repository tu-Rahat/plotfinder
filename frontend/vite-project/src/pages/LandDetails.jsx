import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function LandDetails() {
  const { id } = useParams();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lands/${id}`);
        const data = await res.json();
        setLand(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLand();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!land) return <p>Land not found</p>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>{land.title}</h1>
      <p>{land.description}</p>

      <h3>Price: ৳ {land.price}</h3>
      <p>Size: {land.landSizeSqft} sqft</p>

      <h3>Location</h3>
      <p>
        {land.location.address}, {land.location.upazila},{" "}
        {land.location.district}, {land.location.division}
      </p>

      <h3>Details</h3>
      <p>Type: {land.landType}</p>
      <p>Ownership: {land.ownershipType}</p>
      <p>Road Access: {land.roadAccess}</p>
      <p>Negotiable: {land.priceNegotiable ? "Yes" : "No"}</p>

      <h3>Seller</h3>
      <p>Name: {land.sellerFirstName} {land.sellerLastName}</p>
      <p>Email: {land.sellerEmail}</p>
      <p>Phone: {land.sellerPhone}</p>
    </div>
  );
}

export default LandDetails;