import { useEffect, useState } from "react";
import axios from "axios";

export const useUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("https://hiresense-server.onrender.com/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("User fetch error", err);
        localStorage.removeItem("token"); // Optionally clear token if invalid
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
};
