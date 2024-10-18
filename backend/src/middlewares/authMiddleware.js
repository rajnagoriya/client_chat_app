import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

const authMiddleware = (req, res, next) => {
  const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

  // console.log(token);
  if (!token) {
    return next(new ApiError(401, 'Unauthorized please login'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info in request object
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid Token'));
  }
};

export default authMiddleware;
