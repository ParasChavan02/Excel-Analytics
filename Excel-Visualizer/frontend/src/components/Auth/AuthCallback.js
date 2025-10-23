import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        // Store the token
        localStorage.setItem('authToken', token);
        
        // Get user info and update auth context
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            // Update auth context
            login({ token, user: data.user });
            // Redirect to dashboard
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          navigate('/auth?error=callback_failed');
        }
      } else {
        navigate('/auth?error=no_token');
      }
    };

    handleCallback();
  }, [login, navigate]);

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Completing sign in...</p>
    </div>
  );
};

export default AuthCallback;