const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          username: profile.emails[0].value.split('@')[0], // Using email prefix as username
          password: Math.random().toString(36).slice(-8), // Generate random password
          googleId: profile.id
        });
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Initialize passport middleware
router.use(passport.initialize());

// Google Auth Routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/auth?error=google_auth_failed` 
  }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user);
      
      // Store user data
      const userData = {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        username: req.user.username
      };

      // Encode user data and token for URL-safe transmission
      const encodedToken = encodeURIComponent(token);
      const encodedUserData = encodeURIComponent(JSON.stringify(userData));

      // Redirect to frontend with token and user data
      res.redirect(
        `${process.env.CLIENT_URL}?token=${encodedToken}&userData=${encodedUserData}`
      );
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/auth?error=callback_failed`);
    }
  }
);

module.exports = router;