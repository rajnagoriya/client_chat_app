"use client";

import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useStateContext } from '@/providers/StateContext';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';

const SocketProvider = ({ children }) => {
  const token = Cookies.get("chatAppToken");
  const { 
    state, 
    setSocket, 
    setAddMessage, 
    setMessageStatusRead, 
    setUserOnline, 
    setUserOffline, 
    setOnlineUsers,
    addGroupMessage,
    incrementUnread,
    resetUnread,
    setMessages,
    setGroupMessages,
    setGroups,
    updateGroupLastMessageTime
  } = useStateContext();
  const { 
    user, 
    currentGroup, 
    groupMessages,
    messages,
    groups
  } = state;
  const socketRef = useRef();

  useEffect(() => {
    if (user) {
      socketRef.current = io(process.env.NEXT_PUBLIC_HOST, {
        transports: ['websocket'],
        auth: {
          token: token, // Assuming you have a JWT token
        },
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      // Listen for incoming private messages msg-receive
      socketRef.current.on("msg-receive", (data) => {
        
        if (data && data.message) {
          setAddMessage(data.message);
        } 
      });

      // Listen for message read events
      socketRef.current.on("message-read", (data) => {
        if (data && data.messageId) {
          setMessageStatusRead(data.messageId, 'read');
        }
      });

      // Listen for user online
      socketRef.current.on("user-online", (data) => {
        if (data && data.userId) {
          setUserOnline(data.userId);
        }
      });

      // Listen for user offline
      socketRef.current.on("user-offline", (data) => {
        if (data && data.userId) {
          setUserOffline(data.userId);
        }
      });

      // Listen for initial online users
      socketRef.current.on("online-users", (data) => {
        if (data && data.onlineUsers) {
          setOnlineUsers(data.onlineUsers);
        }
      });
 
      // Listen for private message deletion
      socketRef.current.on('msg-deleted', (data) => {
        const { messageId } = data;
        setMessages(messages.filter((msg) => msg.id !== messageId));
      });

        // Listen for incoming group messages
        socketRef.current.on('group-msg-receive', (data) => {
          const { groupId, message } = data;
          if (message) {
            if (currentGroup && currentGroup.id === groupId) {
              addGroupMessage(message);
              markMessagesAsRead(groupId);
            } else {
              incrementUnread(groupId);
            }
            // Update lastMessageTime for the group
            updateGroupLastMessageTime(groupId, message.createdAt);
          }
        });

      // Listen for group message deletion
      socketRef.current.on('group-msg-deleted', (data) => {
        const { groupId, messageId } = data;
        if (currentGroup && currentGroup.id === groupId) {
          setGroupMessages(groupMessages.filter((msg) => msg.id !== messageId))
        }
      });

      // Emit 'add-user' event after successful connection
      socketRef.current.emit("add-user", user.id);

      setSocket(socketRef.current);

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [
    user, 
    setAddMessage, 
    setMessageStatusRead, 
    setUserOnline, 
    setUserOffline, 
    setOnlineUsers, 
    setSocket, 
    addGroupMessage, 
    incrementUnread, 
    currentGroup,
    messages,
    groupMessages
  ]);

  // Function to mark messages as read
  const markMessagesAsRead = async (groupId) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${groupId}/mark-as-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        resetUnread(groupId);
      }
    } catch (error) {
      toast.error('something went wrong !!');
    }
  };

  return <>{children}</>;
};

export default SocketProvider;