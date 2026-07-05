import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies ? req.cookies.token : null;
    console.log("Auth Middleware - Cookies:", req.cookies);
    console.log("Auth Middleware - Token:", token);
    
    if (!token) {
      return res.status(401).json({
        message: "Access Denied. No token provided."
      });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  }
  catch (e) {
    console.log("Auth Middleware Error:", e);
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}