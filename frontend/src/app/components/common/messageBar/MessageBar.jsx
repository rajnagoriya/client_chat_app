"use client";
import { useStateContext } from '@/providers/StateContext';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import Cookies from 'js-cookie';
import { useReactMediaRecorder } from "react-media-recorder";
import AttachmentDropdown from './AttachmentDropdown';
import EmojiPickerComponent from './EmojiPickerComponent';
import FilePreview from './FilePreview';
import MessageInput from './MessageInput';
import SendButton from './SendButton';

function MessageBar() {
  const token = Cookies.get("chatAppToken");
  const { state, setAddMessage, addGroupMessage } = useStateContext();
  const { user, currentChatUser, currentGroup, socket } = state;

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const emojiPickerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Audio recording using react-media-recorder
  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true });

  useEffect(() => {
    if (mediaBlobUrl) {
      fetch(mediaBlobUrl)
        .then(res => res.blob())
        .then(blob => {
          const audioFile = new File([blob], "audio_recording.webm", { type: blob.type });
          setSelectedFile(audioFile);
          setFileType(blob.type.split('/')[0]);
          setFilePreview(mediaBlobUrl);
        })
        .catch(err => {
          toast.error("Failed to process the recorded audio.");
        });
    }
  }, [mediaBlobUrl]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Handle clicks outside of emoji picker and dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setFileType(file.type.split('/')[0]);
    setFilePreview(URL.createObjectURL(file));
  };

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const addEmoji = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  const sendMessage = async () => {
    // Prevent sending both message and attachment together
    if (message.trim() && selectedFile) {
      toast.error("Please send either a message or an attachment, not both.");
      return;
    }

    if (!message.trim() && !selectedFile) return;

    const formData = new FormData();
    const isGroupMessage = !!currentGroup;

    if (isGroupMessage) {
      formData.append('senderId', user?.id);
      formData.append('message', message);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      try {
        setMessage("");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/messages`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send group message!");
        console.error("Failed to send group message", error);
      }

    } else {
      // Handle direct message
      formData.append('from', user?.id);
      formData.append('to', currentChatUser?.id);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (message.trim()) {
        formData.append('message', message);
      }

      try {
        setMessage("");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_HOST}/api/v1/message/addMessages`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data.data;
        if (response.status >= 200 && response.status < 300) {
          socket.emit('send-msg', {
            to: currentChatUser?.id,
            from: user?.id,
            message: data,
          });
          setAddMessage(data);
        }
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong, try again!");
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
  };

  return (
    <div className="relative bg-panel-header-background h-20 px-4 flex items-center gap-6">
      {/* Emoji Picker */}
      <div ref={emojiPickerRef}>
        <EmojiPickerComponent
          showEmojiPicker={showEmojiPicker}
          toggleEmojiPicker={toggleEmojiPicker}
          addEmoji={addEmoji}
        />
      </div>

      {/* File Attachment Dropdown */}
      <div ref={dropdownRef}>
        <AttachmentDropdown
          showDropdown={showDropdown}
          toggleDropdown={toggleDropdown}
          handleFileSelect={handleFileSelect}
        />
      </div>

      {/* Message Input */}
      <MessageInput
        message={message}
        setMessage={setMessage}
        disabled={!!selectedFile}
      />

      {/* Send Button or Microphone */}
      <SendButton
        hasContent={selectedFile || message}
        sendMessage={sendMessage}
        isRecording={status === "recording"}
        startRecording={startRecording}
        stopRecording={stopRecording}
      />

      {/* File Preview */}
      {filePreview && (
        <div className="absolute bottom-20 left-4 p-4 bg-gray-700 text-white shadow-lg rounded-lg w-80 z-50">
          <FilePreview
            fileType={fileType}
            filePreview={filePreview}
            selectedFile={selectedFile}
            onRemove={removeFile}
          />
        </div>
      )}
    </div>
  );
}

export default MessageBar;