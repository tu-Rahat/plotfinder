const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v2/places";

const CATEGORY_CONFIG = {
  school: "education.school",
  hospital: "healthcare.hospital",
  bank: "service.financial.bank",
  restaurant: "catering.restaurant",
  bus_stop: "public_transport.bus",
  mosque: "religion.place_of_worship",
  market: "commercial.marketplace",
};

const CATEGORY_LABELS = {
  school: "School",
  hospital: "Hospital",
  bank: "Bank",
  restaurant: "Restaurant",
  bus_stop: "Bus Stop",
  mosque: "Mosque",
  market: "Market",
};

const getNearbyPlaces = async (latitude, longitude) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error("Geoapify API key is missing");
  }

  const radiusInMeters = 3000;
  const limitPerCategory = 1;

  const categoryEntries = Object.entries(CATEGORY_CONFIG);

  const requests = categoryEntries.map(async ([key, category]) => {
    const url = `${GEOAPIFY_BASE_URL}?categories=${encodeURIComponent(
      category
    )}&filter=circle:${longitude},${latitude},${radiusInMeters}&bias=proximity:${longitude},${latitude}&limit=${limitPerCategory}&apiKey=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch nearby ${key}`);
    }

    const data = await response.json();
    const place = data?.features?.[0];

    if (!place) {
      return {
        key,
        label: CATEGORY_LABELS[key],
        found: false,
        name: "Not found nearby",
        distanceMeters: null,
        address: "",
      };
    }

    return {
      key,
      label: CATEGORY_LABELS[key],
      found: true,
      name:
        place.properties.name ||
        place.properties.address_line1 ||
        CATEGORY_LABELS[key],
      distanceMeters: place.properties.distance || null,
      address:
        place.properties.formatted ||
        place.properties.address_line2 ||
        "",
    };
  });

  const results = await Promise.all(requests);

  return results;
};

module.exports = {
  getNearbyPlaces,
};