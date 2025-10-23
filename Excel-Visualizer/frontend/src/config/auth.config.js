export const authConfig = {
  google: {
    clientId: "1084580819063-7tihrbu2a2bd3nlu5ghpqcfm6v6djagg.apps.googleusercontent.com", // You'll need to replace this with your actual Google Client ID
    clientSecret: "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", // You'll need to replace this with your actual Google Client Secret
  },
  redirectUri: "http://localhost:3000/auth/callback", // This should match what you set in Google Cloud Console
};