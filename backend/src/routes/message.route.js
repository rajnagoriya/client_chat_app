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
// add auth middleware 
router.get('/getMessages/:from/:to', authMiddleware,(getMessages));
router.get("/getInitialContacts/:from",asyncHandler(getInitialContactsWithMessages));

router.post('/addMessages', upload.single('file'),(addMessage));
router.post('/forward', authMiddleware, (forwardMessage));

router.delete("/clear/:currentChatUserId", authMiddleware, (clearChat)); 
router.delete('/deleteForMe/:messageId', authMiddleware, (deleteMessageForMe));
router.delete('/deleteForEveryone/:messageId', authMiddleware, (deleteMessageForEveryone));

export default router;
