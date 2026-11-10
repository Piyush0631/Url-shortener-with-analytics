const getLocation = async (ip) => {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  if (!response.ok) {
    throw new Error("Failed to get location");
  }
  const data = await response.json();
  return {
    country: data.country,
    city: data.city,
    zip: data.zip,
  };
};

export default getLocation;
