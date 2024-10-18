// routes/group.route.js
import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  createGroup,
  getGroupMessages,
  sendGroupMessage,
  markGroupMessagesAsRead,
  getGroupsWithUnreadCounts,
  getGroupMembersByGroupId,
  removeGroupMember,
  addGroupMember,
  deleteGroup,
  clearGroupChat,
  deleteGroupMessageFromMe,
  deleteGroupMessageForEveryone,
  updateGroupInfo,
} from '../controllers/group.controller.js';
import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

// All routes are protected
router.use(authMiddleware);



router.get('/unread', getGroupsWithUnreadCounts); // GET /api/v1/group/unread
router.get('/:groupId/messages', getGroupMessages); // GET /api/v1/group/:groupId/messages
router.get('/groupMember/:groupId',getGroupMembersByGroupId);



router.post('/:groupId/mark-as-read', markGroupMessagesAsRead); // POST /api/v1/group/:groupId/mark-as-read
// Send a message to a group
router.post('/:groupId/messages', upload.single('file'), asyncHandler(sendGroupMessage));
// Create a new group
router.post('/create', upload.single('avatar'), asyncHandler(createGroup));
// Add a member to a group
router.post('/:groupId/add', asyncHandler(addGroupMember));


// New Route: Delete Group
router.delete('/:groupId', asyncHandler(deleteGroup));
// New Route: Clear Group Chat
router.delete('/:groupId/messages/clear', asyncHandler(clearGroupChat));
// Delete a specific message in a group chat
router.delete('/:groupId/message/:messageId/delete-for-me', asyncHandler(deleteGroupMessageFromMe));
router.delete('/:groupId/message/:messageId/delete-for-everyone', deleteGroupMessageForEveryone);
// Remove a member from a group
router.delete('/:groupId/remove', asyncHandler(removeGroupMember));


// Update group information
router.put('/:groupId', upload.single('avatar'), asyncHandler(updateGroupInfo));

export default router;
