import jwt from "jsonwebtoken";
import User from "../src/models/userModels.js";
import httpStatus from "http-status";

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if(!token){
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if(!user) return res.status(httpStatus.NOT_FOUND).json({message: "Please login in first"});

    if(user.tokenVersion !== decoded.tokenVersion){
        res.status(401).json({ message: "Session expired, please login again" });
    }
    
    req.user = decoded; // { userId, username, tokenVersion}
    next();
  } catch(err) {
    // fake token, expired token, tampered token — all caught here
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticate;