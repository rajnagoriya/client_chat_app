// controllers/group.controller.js
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import prisma from '../utils/prisma.js';
import { io, onlineUsers } from '../app.js';
import fs from 'fs';
import path from 'path';
import { createGroupSchema } from '../validations/groupValidation.js';

// Create a new group
export const createGroup = async (req, res, next) => {
  const avatar = req.file ? req.file.path : '';
  const { name, adminId, about } = req.body;

  // Validation
  if (!name || !adminId) {
    return next(new ApiError(400, 'Group name and admin ID are required.'));
  }

  try {
    // Check if admin exists
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(adminId) },
    });

    if (!admin) {
      return next(new ApiError(404, 'Admin user not found.'));
    }

    // Process members array
    const members = req.body.members || [];
    const memberIds = Array.isArray(members) ? members.map(id => parseInt(id)) : [parseInt(members)];

    // Ensure admin is included
    const uniqueMemberIds = Array.from(new Set([parseInt(adminId), ...memberIds]));

    // Check if all members exist
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: uniqueMemberIds } },
      select: { id: true },
    });

    const existingUserIds = existingUsers.map(user => user.id);
    const invalidUserIds = uniqueMemberIds.filter(id => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      return next(new ApiError(400, `User(s) not found: ${invalidUserIds.join(', ')}`));
    }

    // Prepare groupMembers data
    const groupMembersData = uniqueMemberIds.map(userId => ({ userId }));

    // Create the group
    const newGroup = await prisma.group.create({
      data: {
        name,
        avatar,
        about: about || null,
        adminId: parseInt(adminId),
        groupMembers: {
          create: groupMembersData,
        },
      },
      include: {
        groupMembers: {
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true },
            },
          },
        },
      },
    });

    // Notify admin if online
    if (onlineUsers.has(parseInt(adminId))) {
      const adminSockets = onlineUsers.get(parseInt(adminId));
      adminSockets.forEach((socketId) => {
        io.to(socketId).emit('group-created', { group: newGroup });
      });
    }
    return res.status(201).json(new ApiResponse(201, newGroup, 'Group created successfully.'));
  } catch (error) {
    // Handle file cleanup in case of error
    if (avatar) {
      fs.unlink(path.resolve(avatar), (err) => {
        if (err) console.error('Error deleting avatar file:', err);
      });
    }

    return next(new ApiError(500, 'Failed to create group.'));
  }
};

// Function to get all members of a group by groupId
export const getGroupMembersByGroupId = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: parseInt(groupId) }, 
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true,
            about: true,
          },
        },
      },
    });

    // Check if no members were found
    if (!groupMembers.length) {
      return res.status(404).json(new ApiResponse(404, [], 'No members found for this group.'));
    }

    return res.status(200).json(new ApiResponse(200, groupMembers, 'Group members fetched successfully.'));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, 'Failed to fetch group members.'));
  }
};

// Remove a member from a group
export const removeGroupMember = async (req, res, next) => {
  const { groupId } = req.params;
  const { userId, adminId } = req.body;
console.log("the userid and the adminid is :-"+userId, adminId)
  // Validation
  if (!userId || !adminId) {
    return next(new ApiError(400, 'User ID and Admin ID are required.'));
  }

  try {
    // Fetch the group with admin information
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      include: { admin: true },
    });

    if (!group) {
      return next(new ApiError(404, 'Group not found.'));
    }

    // Verify if the requester is the admin
    if (group.adminId !== parseInt(adminId)) {
      return next(new ApiError(403, 'Only group admins can remove members.'));
    }

    // Prevent admin from being removed
    if (group.adminId === parseInt(userId)) {
      return next(new ApiError(400, 'Admin cannot be removed from the group.'));
    }

    // Check if user is a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: parseInt(userId),
          groupId: parseInt(groupId),
        },
      },
    });

    if (!existingMember) {
      return next(new ApiError(400, 'User is not a member of the group.'));
    }

    // Remove user from the group
    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: parseInt(userId),
          groupId: parseInt(groupId),
        },
      },
    });

    // Notify the user if online
    if (onlineUsers.has(parseInt(userId))) {
      const userSockets = onlineUsers.get(parseInt(userId));
      userSockets.forEach((socketId) => {
        io.to(socketId).emit('removed-from-group', { groupId: parseInt(groupId), groupName: group.name });
      });
    }

    return res.status(200).json(new ApiResponse(200, null, 'Member removed successfully.'));
  } catch (error) {
    return next(new ApiError(500, 'Failed to remove group member.'));
  }
};

export const addGroupMember = async (req, res, next) => {
  const { groupId } = req.params;
  const { userIds, adminId } = req.body;

  // Validation: Ensure adminId and userIds are provided
  if (!userIds || !adminId || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new ApiError(400, 'Admin ID and at least one user ID are required.'));
  }

  try {
    // Fetch the group with admin information
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      include: { admin: true },
    });

    if (!group) {
      return next(new ApiError(404, 'Group not found.'));
    }

    // Verify if the requester is the admin
    if (group.adminId !== parseInt(adminId)) {
      return next(new ApiError(403, 'Only group admins can add members.'));
    }

    const addedUsers = [];
    const existingMembers = [];

    // Loop through the userIds array and process each user
    for (const userId of userIds) {
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
      });

      if (!user) {
        // Skip this user if not found
        continue;
      }

      // Check if the user is already a member of the group
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          userId_groupId: {
            userId: parseInt(userId),
            groupId: parseInt(groupId),
          },
        },
      });

      if (existingMember) {
        existingMembers.push(user); // Add to existing members list
      } else {
        // Add user to the group if they're not already a member
        const addedMember = await prisma.groupMember.create({
          data: {
            groupId: parseInt(groupId),
            userId: parseInt(userId),
          },
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true },
            },
          },
        });

        addedUsers.push(addedMember.user); // Add to added members list
      }
    }
    return res.status(200).json(new ApiResponse(200, {
      addedUsers,
    }, `${addedUsers.length} users added to the group.`));
  } catch (error) {
    return next(new ApiError(500, 'Failed to add users to the group.'));
  }
};

 // Send a message to a group
export const sendGroupMessage = async (req, res, next) => {
  const { groupId } = req.params;
  const { senderId, message, type } = req.body;
  const file = req.file;

  // Validation
  if (!senderId || (!message && !file)) {
    return next(new ApiError(400, 'Sender ID and message or file are required.'));
  }

  try {
    // Check if user is a member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: parseInt(senderId),
          groupId: parseInt(groupId),
        },
      },
    });

    if (!member) {
      return next(new ApiError(403, 'You are not a member of this group.'));
    }

    // Handle file upload if present
    let messageContent = message;
    let messageType = type || 'text';
    if (file) {
      messageContent = file.path;
      if (file.mimetype.startsWith('image/')) {
        messageType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        messageType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        messageType = 'audio';
      } else {
        messageType = 'application';
      }
    }

    // Create the group message
    const newGroupMessage = await prisma.groupMessage.create({
      data: {
        groupId: parseInt(groupId),
        senderId: parseInt(senderId),
        message: messageContent,
        type: messageType,
      },
      include: {
        sender: { select: { id: true, username: true, profilePicture: true } },
      },
    });

    // Mark the message as read for the sender
    await prisma.groupMessageRead.create({
      data: {
        messageId: newGroupMessage.id,
        userId: parseInt(senderId),
      },
    });

    // Emit the message to all group members who are online
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: parseInt(groupId) },
      select: { userId: true },
    });

    groupMembers.forEach((member) => {
      const userId = member.userId;
      if (onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId);
        userSockets.forEach((socketId) => {
          io.to(socketId).emit('group-msg-receive', {
            groupId: parseInt(groupId),
            message: newGroupMessage,
          });
        });
      }
    });
    return res.status(200).json(new ApiResponse(200, newGroupMessage, 'Message sent successfully.'));
  } catch (error) {
    console.error('Error sending group message:', error);

    // Handle file cleanup in case of error
    if (file) {
      fs.unlink(path.resolve(file.path), (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }

    return next(new ApiError(500, 'Failed to send group message.'));
  }
};

//Fetch all groups the user is part of with unread message counts
export const getGroupsWithUnreadCounts = async (req, res, next) => {
  const userId = req.user.id;
  try {
    // Fetch all groups the user is a member of
    const groups = await prisma.group.findMany({
      where: {
        groupMembers: {
          some: {
            userId: userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        about: true,
        adminId: true,
        groupMessages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    });

    const groupIds = groups.map(group => group.id);

    // Calculate unread messages per group
    const unreadCounts = await prisma.groupMessage.groupBy({
      by: ['groupId'],
      where: {
        groupId: { in: groupIds },
        NOT: {
          groupMessageReads: {
            some: {
              userId: userId,
            },
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    // Map groupId to unread count
    const unreadCountMap = new Map();
    unreadCounts.forEach(entry => {
      unreadCountMap.set(entry.groupId, entry._count._all);
    });

    // unread counts and last message time
    const groupsWithUnreadCounts = groups.map(group => ({
      ...group,
      unreadCount: unreadCountMap.get(group.id) || 0,
      lastMessageTime: group.groupMessages[0]?.createdAt || null, // Get last message time
    }));

    res.status(200).json(new ApiResponse(200, groupsWithUnreadCounts, "Groups with unread counts"));
  } catch (error) {
    return next(new ApiError(500, 'Failed to fetch groups.'));
  }
};

// Mark all unread messages in a group as read for the user
export const markGroupMessagesAsRead = async (req, res, next) => {
  const userId = req.user.id;
  const { groupId } = req.params;

  try {
    // Find all unread messages in the group
    const unreadMessages = await prisma.groupMessage.findMany({
      where: {
        groupId: parseInt(groupId),
        NOT: {
          groupMessageReads: {
            some: {
              userId: userId,
            },
          },
        },
      },
      select: { id: true },
    });

    const unreadMessageIds = unreadMessages.map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      const createReads = unreadMessageIds.map(id => ({
        messageId: id,
        userId: userId,
      }));

      await prisma.groupMessageRead.createMany({
        data: createReads,
        skipDuplicates: true,
      });
    }

    res.status(200).json(new ApiResponse(200, { markedAsRead: unreadMessageIds.length }, "Messages marked as read"));
  } catch (error) {
    return next(new ApiError(500, 'Failed to mark messages as read.'));
  }
};

export const getGroupMessages = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is a member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: parseInt(groupId),
        },
      },
    });

    if (!member) {
      return next(new ApiError(403, 'You are not a member of this group.'));
    }

    // Fetch messages excluding those deleted by the user
    const messages = await prisma.groupMessage.findMany({
      where: {
        groupId: parseInt(groupId),
        NOT: {
          deletedBy: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        sender: { select: { id: true, username: true, profilePicture: true } },
        groupMessageReads: {
          where: { userId: userId },
          select: { readAt: true },
        },
      },
      orderBy: { createdAt: 'asc' }, // Adjust as needed
    });

    // Format messages to include read status
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      groupId: msg.groupId,
      senderId: msg.senderId,
      sender: msg.sender,
      message: msg.message,
      type: msg.type,
      createdAt: msg.createdAt,
      readAt: msg.groupMessageReads.length > 0 ? msg.groupMessageReads[0].readAt : null,
    }));

    res.status(200).json(new ApiResponse(200, { messages: formattedMessages }, "Group messages fetched successfully."));
  } catch (error) {
    return next(new ApiError(500, 'Failed to fetch group messages.'));
  }
};

 // Only the group admin can delete the group.
export const deleteGroup = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id; 

  try {
    // Fetch the group
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId, 10) },
    });

    if (!group) {
      return next(new ApiError(404, 'Group not found.'));
    }

    // Check if the requester is the admin
    if (group.adminId !== userId) {
      return next(new ApiError(403, 'Only group admins can delete the group.'));
    }

    // Delete the group (cascading deletes related records)
    await prisma.group.delete({
      where: { id: parseInt(groupId, 10) },
    });

    return res.status(200).json(new ApiResponse(200, {}, 'Group and all related data deleted successfully.'));
  } catch (error) {
    return next(new ApiError(500, 'Failed to delete the group.'));
  }
};

// clear group chat 
export const clearGroupChat = async (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user.id; 

  try {
    // Verify that the user is a member of the group
    const groupMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: userId,
          groupId: parseInt(groupId),
        },
      },
    });

    if (!groupMember) {
      return next(new ApiError(403, 'You are not a member of this group.'));
    }

    // Fetch all group message IDs that are not yet deleted by this user
    const messages = await prisma.groupMessage.findMany({
      where: { groupId: parseInt(groupId) },
      select: { id: true },
    });

    const existingDeletedMessages = await prisma.deletedGroupMessage.findMany({
      where: {
        messageId: { in: messages.map(msg => msg.id) },
        userId: userId,
      },
      select: { messageId: true },
    });

    const alreadyDeletedMessageIds = new Set(existingDeletedMessages.map(msg => msg.messageId));
    const newDeletions = messages
      .filter(msg => !alreadyDeletedMessageIds.has(msg.id))
      .map(msg => ({
        messageId: msg.id,
        userId: userId,
      }));

    if (newDeletions.length > 0) {
      await prisma.deletedGroupMessage.createMany({
        data: newDeletions,
      });
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Group chat cleared successfully.'));
  } catch (error) {
    return next(new ApiError(500, 'Failed to clear group chat.'));
  }
};

export const deleteGroupMessageFromMe = async (req, res, next) => {
  const { groupId, messageId } = req.params;
  const userId = req.user.id;

  try {
    // Check if the user is a member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId: parseInt(groupId) },
      },
    });

    if (!member) {
      return next(new ApiError(403, 'You are not a member of this group.'));
    }

    // Mark the message as deleted for this user only
    await prisma.deletedGroupMessage.create({
      data: {
        messageId: parseInt(messageId),
        userId: userId,
      },
    });

    res.status(200).json(new ApiResponse(200, null, 'Message deleted from group.'));
  } catch (error) {
    return next(new ApiError(500, 'Failed to delete group message.'));
  }
};

export const deleteGroupMessageForEveryone = async (req, res, next) => {
  const { groupId, messageId } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the message to verify if the user is the sender
    const message = await prisma.groupMessage.findUnique({
      where: { id: parseInt(messageId) },
      include: { sender: true }, // To verify sender
    });

    if (!message) {
      return next(new ApiError(404, 'Message not found.'));
    }

    // Check if the user is the sender of the message
    if (message.senderId !== userId) {
      return next(new ApiError(403, 'You can only delete messages you sent.'));
    }

    // Delete the message from the database
    await prisma.groupMessage.delete({
      where: { id: parseInt(messageId) },
    });

    // Optionally, clean up any related read receipts or deleted message records
    await prisma.groupMessageRead.deleteMany({
      where: { messageId: parseInt(messageId) },
    });
    await prisma.deletedGroupMessage.deleteMany({
      where: { messageId: parseInt(messageId) },
    });

    // Fetch all members of the group to emit the event
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: parseInt(groupId) },
      select: { userId: true },
    });

    // Emit 'group-msg-deleted' to all online group members
    groupMembers.forEach(member => {
      const memberSockets = onlineUsers.get(member.userId);
      if (memberSockets) {
        memberSockets.forEach(socketId => {
          io.to(socketId).emit('group-msg-deleted', { groupId: parseInt(groupId), messageId: parseInt(messageId) });
        });
      }
    });

    res.status(200).json(new ApiResponse(200, null, 'Message deleted for everyone.'));
  } catch (error) {
    return next(new ApiError(500, 'Failed to delete group message for everyone.'));
  }
};

export const updateGroupInfo = async (req, res, next) => {
  const { groupId } = req.params; 
  const { name, about } = req.body; 
  const avatar = req.file ? req.file.path : null; 
  const userId = req.user.id;
  try {
    // Check if the group exists
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
    });

    if (!group) {
      return next(new ApiError(404, 'Group not found.'));
    }

    //  Check if the user is the admin of the group
    if (group.adminId !== userId) {
      return next(new ApiError(403, 'Only the admin can update this group.'));
    }

    // Update the group details
    const updatedGroup = await prisma.group.update({
      where: { id: parseInt(groupId) },
      data: {
        name: name || group.name, 
        about: about || group.about,
        avatar: avatar || group.avatar,
      },
      include: {
        groupMembers: {
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true },
            },
          },
        },
      },
    });

    //Clean up the old avatar if a new one was uploaded
    if (avatar && group.avatar) {
      const oldAvatarPath = path.resolve(group.avatar);
      fs.unlink(oldAvatarPath, (err) => {
        if (err) console.error('Error deleting old avatar file:', err);
      });
    }

    return res.status(200).json(new ApiResponse(200, updatedGroup, 'Group updated successfully.'));
  } catch (error) {
    // Handle file cleanup in case of error
    if (avatar) {
      fs.unlink(path.resolve(avatar), (err) => {
        if (err) console.error('Error deleting new avatar file:', err);
      });
    }

    return next(new ApiError(500, 'Failed to update group.'));
  }
};
