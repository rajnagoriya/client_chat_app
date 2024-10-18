import express from 'express';
import asyncHandler from "../utils/asyncHandler.js";
import authMiddleware from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.middleware.js'
import {
    login,
    register,
    removeProfilePicture,
    searchUsers,
    updateProfile
} from '../controllers/user.controller.js';


const router = express.Router();


router.get("/search", authMiddleware, asyncHandler(searchUsers));
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.patch('/update-profile',
    authMiddleware,
    upload.single('profilePicture'),
    asyncHandler(updateProfile)
);
router.delete('/update-profile',
    authMiddleware,
    asyncHandler(removeProfilePicture)
);

export default router;
