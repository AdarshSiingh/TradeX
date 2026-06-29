const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authService = require('../services/auth.service');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { user, token } = await authService.googleAuth({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        });

        done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

module.exports = passport;