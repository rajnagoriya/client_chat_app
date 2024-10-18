// message.controller.js
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import prisma from '../utils/prisma.js';
import { io, onlineUsers } from '../app.js';


export const getMessages = async (req, res, next) => {
  const { from, to } = req.params;
  const userId = req.user.id;

  try {
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: parseInt(from), receiverId: parseInt(to) },
          { senderId: parseInt(to), receiverId: parseInt(from) },
        ],
      },
      orderBy: { id: "asc" },
    });

    // Get all the messages that this user has deleted
    const deletedMessages = await prisma.deletedMessage.findMany({
      where: {
        userId: userId,
        messageId: { in: messages.map((msg) => msg.id) },
      },
      select: { messageId: true },
    });

    const deletedMessageIds = new Set(deletedMessages.map((msg) => msg.messageId));

    // Filter out the deleted messages
    const filteredMessages = messages.filter(msg => !deletedMessageIds.has(msg.id));

    // Handle unread messages (existing logic)
    const unreadMessages = filteredMessages.filter(
      (msg) => msg.messageStatus !== "read" && msg.senderId === parseInt(to)
    );

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map(msg => msg.id);
      // Update message statuses to "read"
      await prisma.messages.updateMany({
        where: { id: { in: messageIds } },
        data: { messageStatus: "read" },
      });

      // Notify senders that their messages have been read
      unreadMessages.forEach((message) => {
        const senderSockets = onlineUsers.get(message.senderId);
        if (senderSockets) {
          senderSockets.forEach((socketId) => {
            io.to(socketId).emit("message-read", {
              messageId: message.id,
              from: message.receiverId,
              readAt: new Date(),
            });
          });
        }
      });
    }

    return res.status(200).json(new ApiResponse(200, filteredMessages));
  } catch (error) {
    return next(new ApiError(500, "Error fetching messages"));
  }
};

export const addMessage = async (req, res, next) => {
  const { message, from, to } = req.body;

  // Check if necessary data is missing
  if (!from || !to || (!message && !req.file)) {
      return next(new ApiError(400, "Missing required fields!"));
  }

  const isReceiverOnline = onlineUsers.has(parseInt(to));

  const newMessageData = {
      sender: { connect: { id: parseInt(from) } },
      receiver: { connect: { id: parseInt(to) } },
      messageStatus: isReceiverOnline ? "delivered" : "sent",
  };

  // Check if there's a file in the request
  if (req.file) {
      const fileType = req.file.mimetype.split('/')[0];
      newMessageData.type = fileType;  // Store type as 'image', 'video', 'audio', or 'application'
      newMessageData.message = req.file.path; // Store the file path
  } else {
      // This is a plain text message
      newMessageData.type = 'text';
      newMessageData.message = message;
  }

  try {
      // Save the message to the database
      const newMessage = await prisma.messages.create({
          data: newMessageData,
          include: {
              sender: { select: { id: true, username: true, profilePicture: true } },
              receiver: { select: { id: true, username: true, profilePicture: true } },
          },
      });

      // Emit the message to the receiver if online
      if (isReceiverOnline) {
          const receiverSockets = onlineUsers.get(parseInt(to));
          receiverSockets.forEach((socketId) => {
              io.to(socketId).emit("msg-recieve", { from: parseInt(from), message: newMessage });
          });
      }

      return res.status(200).json(new ApiResponse(200, newMessage, "Message sent"));
  } catch (error) {
      return next(new ApiError(400, "Error while sending message"));
  }
};

export const getInitialContactsWithMessages = async (req, res, next) => {
  const userId = parseInt(req.params.from);
  if (!userId) {
    return next(new ApiError(400, "Error while fetching user!!"));
  }

  try {
    // Fetch user with sent and received messages, and filter deleted messages
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: { receiver: true, sender: true, deletedMessages: true }, 
          orderBy: { createdAt: "desc" },
        },
        receivedMessages: {
          include: { receiver: true, sender: true, deletedMessages: true }, 
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Combine sent and received messages
    const messages = [...user.sentMessages, ...user.receivedMessages];

    // Filter out messages deleted by the user
    const filteredMessages = messages.filter(msg => 
      !msg.deletedMessages.some(deletedMsg => deletedMsg.userId === userId)
    );

    // Sort messages by creation date (descending)
    filteredMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const users = new Map();
    const messageStatusChange = [];

    filteredMessages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.receiverId : msg.senderId;

      // Track message status changes for "sent" messages
      if (msg.messageStatus === "sent") {
        messageStatusChange.push(msg.id);
      }

      if (!users.get(calculatedId)) {
        const {
          id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        } = msg;

        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        };

        if (isSender) {
          user = {
            ...user,
            ...msg.receiver,
            totalUnreadMessages: 0,
          };
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }

        // Store user info based on the calculated ID
        users.set(calculatedId, {
          ...user,
        });
      } else if (msg.messageStatus !== "read" && !isSender) {
        const user = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    // Update message statuses to "delivered" where necessary
    if (messageStatusChange.length) {
      await prisma.messages.updateMany({
        where: {
          id: { in: messageStatusChange },
        },
        data: {
          messageStatus: "delivered",
        },
      });
    }

    // Respond with filtered users and online users
    return res.status(200).json(
      new ApiResponse(200, {
        users: Array.from(users.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
      }, "Initial data")
    );

  } catch (error) {
    console.log("error in initial contact is :- "+error);
    return next(new ApiError(500, "Error fetching initial contacts with messages"));
  }
};

export const clearChat = async (req, res, next) => {
  const { currentChatUserId } = req.params; 
  const userId = req.user.id; 

  try {
    // Fetch all messages between the two users
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: parseInt(currentChatUserId) },
          { senderId: parseInt(currentChatUserId), receiverId: userId },
        ],
      },
      select: { id: true }, // Select only message IDs
    });

    const messageIds = messages.map((msg) => msg.id);

    const existingDeletedMessages = await prisma.deletedMessage.findMany({
      where: {
        messageId: { in: messageIds },
        userId: userId,
      },
      select: { messageId: true },
    });

    const alreadyDeletedMessageIds = new Set(existingDeletedMessages.map((msg) => msg.messageId));

    // Filter messages that are not yet deleted by this user
    const newDeletions = messageIds
      .filter((id) => !alreadyDeletedMessageIds.has(id))
      .map((messageId) => ({
        messageId: messageId,
        userId: userId,
      }));

    // Add the new deletions to the deletedMessages table
    if (newDeletions.length > 0) {
      await prisma.deletedMessage.createMany({
        data: newDeletions,
      });
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Chat cleared successfully.'));
  } catch (error) {
    return next(new ApiError(500, 'Failed to clear chat.'));
  }
};

// Delete message for the current user (Delete for Me)
export const deleteMessageForMe = async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.user.id;
console.log("msg id and user id is  :- "+ messageId, userId);
  try {
    // Check if the message exists
    const message = await prisma.messages.findUnique({ where: { id: parseInt(messageId) } });

    if (!message) {
      return next(new ApiError(404, "Message not found"));
    }

    // Check if the message is already deleted by the user
    const alreadyDeleted = await prisma.deletedMessage.findUnique({
      where: {
        messageId_userId: { messageId: parseInt(messageId), userId: userId }
      }
    });

    if (alreadyDeleted) {
      return res.status(200).json(new ApiResponse(200, "Message already deleted for you."));
    }

    // Add the message to the DeletedMessage table for this user
    await prisma.deletedMessage.create({
      data: {
        messageId: parseInt(messageId),
        userId: userId
      }
    });

    return res.status(200).json(new ApiResponse(200, "Message deleted for you successfully."));
  } catch (error) {
    return next(new ApiError(500, "Failed to delete message for you."));
  }
};

// Delete message for everyone (Delete for both sender and receiver)
export const deleteMessageForEveryone = async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    // Fetch the message to verify if the user is the sender
    const message = await prisma.messages.findUnique({
      where: { id: parseInt(messageId) },
      include: { sender: true, receiver: true }, // Fetch both sender and receiver
    });

    if (!message) {
      return next(new ApiError(404, "Message not found"));
    }

    // Ensure that only the sender can delete the message for everyone
    if (message.senderId !== userId) {
      return next(new ApiError(403, "You are not authorized to delete this message for everyone."));
    }

    // Delete the message from the Messages table
    await prisma.messages.delete({ where: { id: parseInt(messageId) } });

    // Remove any related deleted message records for this message
    await prisma.deletedMessage.deleteMany({ where: { messageId: parseInt(messageId) } });

    // Emit event to notify the recipient and sender that the message was deleted
    const recipientId = message.receiverId;

    // Get the recipient's sockets (if online)
    const recipientSockets = onlineUsers.get(recipientId);
    if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit('delete-msg-for-everyone', { messageId, to: recipientId });
      });
    }

    return res.status(200).json(new ApiResponse(200, "Message deleted for everyone successfully."));
  } catch (error) {
    return next(new ApiError(500, "Failed to delete message for everyone."));
  }
};

export const forwardMessage = async (req, res, next) => {
  const { messageId, targets, messageType } = req.body;
  
  if (!messageId || !targets || !messageType) {
    return next(new ApiError(400, "Missing required fields"));
  }

  try {
    // Fetch the original message based on messageType
    let originalMessage;
    if (messageType === 'private') {
      originalMessage = await prisma.messages.findUnique({ where: { id: messageId } });
    } else if (messageType === 'group') {
      originalMessage = await prisma.groupMessage.findUnique({ where: { id: messageId } });
    }

    if (!originalMessage) {
      return next(new ApiError(404, "Message not found"));
    }

    const newMessages = [];

    // Forward the message to each selected target
    for (const target of targets) {
      if (target.isGroup) {

        // Forward to group
        const newGroupMessage = await prisma.groupMessage.create({
          data: {
            groupId: parseInt(target.id),
            senderId: req.user.id, // Current user forwarding the message
            message: originalMessage.message,
            type: originalMessage.type,
          },
          include: {
            sender: { select: { id: true, username: true, profilePicture: true } },
          },
        });

        // Emit the message to all group members who are online
        const groupMembers = await prisma.groupMember.findMany({
          where: { groupId: parseInt(target.id) },
          select: { userId: true },
        });

        groupMembers.forEach((member) => {
          const userId = member.userId;
          if (onlineUsers.has(userId)) {
            const userSockets = onlineUsers.get(userId);
            userSockets.forEach((socketId) => {
              io.to(socketId).emit('group-msg-receive', {
                groupId: parseInt(target.id),
                message: newGroupMessage,
              });
            });
          }
        });
      } else {
    

      const isReceiverOnline = onlineUsers.has(parseInt(target.id));
        // Forward to individual user
        const newPrivateMessage = await prisma.messages.create({
          data: {
            sender: { connect: { id: req.user.id } },
            receiver: { connect: { id: parseInt(target.id) } },
            message: originalMessage.message,
            type: originalMessage.type,
            messageStatus: isReceiverOnline ? "delivered" : "sent",
          },
          include: {
            sender: { select: { id: true, username: true, profilePicture: true } },
            receiver: { select: { id: true, username: true, profilePicture: true } },
          },
        });

        newMessages.push({ to: parseInt(target.id), message: newPrivateMessage });

        // Emit the message to the receiver if online
        if (onlineUsers.has(parseInt(target.id))) {
          const receiverSockets = onlineUsers.get(parseInt(target.id));
          receiverSockets.forEach((socketId) => {
            io.to(socketId).emit("msg-receive", { 
              from: req.user.id,  
              message: newPrivateMessage,
            });
          });
        }
      }
    }
   
    return res.status(200).json(new ApiResponse(200, newMessages, "Message forwarded successfully"));
  } catch (error) {
    return next(new ApiError(500, "Error while forwarding message"));
  }
};
