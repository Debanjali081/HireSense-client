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
    axios
      .get('https://hiresense-server.onrender.com/api/user/me', { withCredentials: true })
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
