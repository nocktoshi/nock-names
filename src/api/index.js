import axios from "axios";

const fetchPending = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/pending`);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch pending registrations:", error);
  }
};

const fetchVerified = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/verified`
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch verified registrations:", error);
  }
};

export const fetchRecent = async () => {
  const [pending, verified] = await Promise.all([
    fetchPending(),
    fetchVerified(),
  ]);
  return [...pending, ...verified];
};

export const fetchSearchResults = async (name) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/search?name=${name.replace(".nock", "")}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Failed to search registrations:", error);
  }
};

export const postRegister = async (name, address) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/register`,
    {
      address,
      name: name.toLowerCase(),
    }
  );
  return response.data || [];
};
