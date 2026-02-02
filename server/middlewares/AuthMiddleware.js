import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  let token = req.cookies?.jwt; // ✅ Check for JWT in cookies

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]; // ✅ Extract token from header
  }

  if (!token) {
    console.error("❌ No token found. Headers:", req.headers, "Cookies:", req.cookies);
    return res.status(401).json({ message: "You are not authenticated." });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      console.error("❌ Invalid token:", err.message);
      return res.status(403).json({ message: "Token is not valid." });
    }

    req.userId = payload?.userId || payload?.id; // ✅ Ensure correct property
    console.log("✅ Token verified. User ID:", req.userId);
    next();
  });
};
