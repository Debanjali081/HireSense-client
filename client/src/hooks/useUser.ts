import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  name: string;
  email: string;
  photo: string;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get token from storage

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    axios
      .get('https://hiresense-server.onrender.com/api/user/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};
