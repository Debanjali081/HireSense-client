import { useEffect, useState } from 'react';
import axiosInstance from '../config/axiosConfig'; // Use configured instance

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Add cache busting to ensure fresh session check
        const res = await axiosInstance.get('/api/user/me', {
          params: { _: Date.now() }
        });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};