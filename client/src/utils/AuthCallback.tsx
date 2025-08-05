import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      try {
        await axiosInstance.get('/api/user/me');
        navigate('/dashboard');
      } catch (err) {
        navigate('/login');
      }
    };
    
    verifySession();
  }, [navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;