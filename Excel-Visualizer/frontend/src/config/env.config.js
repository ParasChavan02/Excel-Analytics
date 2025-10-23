const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  environment: process.env.REACT_APP_ENV || 'development',
  isProduction: process.env.REACT_APP_ENV === 'production',
  isDevelopment: process.env.REACT_APP_ENV === 'development',
};

export default config;