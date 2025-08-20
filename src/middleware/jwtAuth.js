const jwt = require("jsonwebtoken");

const jwtAuth = async (req, res, next) => {
  // JWT is usually sent in Authorization header: "Bearer token"
  // console.log("JWT Auth Middleware Triggered");
  const authHeader = req.headers.authorization;
  // console.log("Authorization Header:", authHeader);
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer token"
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach decoded user info to the request object
    // console.log("JWT decoded user:", payload); // Add this line
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = jwtAuth;
