// middleware.jS
const session = require("express-session");

function setCacheHeaders(req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
}

function setNoCacheHeaders(req, res, next) {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}

function configureSession() {
  return session({
    secret: "uuidv4",
    resave: false,
    saveUninitialized: true,
  });
}

module.exports = {
  setCacheHeaders,
  setNoCacheHeaders,
  configureSession,
};
