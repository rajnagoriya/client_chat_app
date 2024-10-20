import express from 'express';
import asyncHandler from "../utils/asyncHandler.js";
import authMiddleware from '../middlewares/authMiddleware.js';
import {
    addMessage,
    clearChat,
    deleteMessageForEveryone,
    deleteMessageForMe,
    forwardMessage,
    getInitialContactsWithMessages,
    getMessages,
} from '../controllers/message.controller.js';
import upload from '../middlewares/multer.middleware.js';


const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// add auth middleware 
router.get('/getMessages/:to', asyncHandler(getMessages));
router.get("/getInitialContacts", asyncHandler(getInitialContactsWithMessages));

router.post('/addMessages', upload.single('file'), asyncHandler(addMessage));
router.post('/forward', asyncHandler(forwardMessage));

router.delete("/clear/:currentChatUserId", asyncHandler(clearChat));
router.delete('/deleteForMe/:messageId', asyncHandler(deleteMessageForMe));
router.delete('/deleteForEveryone/:messageId', asyncHandler(deleteMessageForEveryone));

export default router;
