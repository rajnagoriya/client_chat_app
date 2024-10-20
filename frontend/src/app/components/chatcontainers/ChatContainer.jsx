// "use client";
import { useStateContext } from '@/providers/StateContext';
import axios from 'axios';
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import ChatActionIcons from '../common/ChatActionIcons';
import Loading from '../common/Loading';
import ForwardMessageModal from '../common/modals/ForwardMessageModal';
import MessageBubble from '../common/ui/MessageBubble';

function ChatContainer() {
  const { state, setSelectedMessage, setMessages } = useStateContext();
  const { currentChatUser, user, messages, selectedMessageId, socket, groups, userContacts } = state;

  const token = Cookies.get('chatAppToken');
  const messageRefs = useRef({});
  const [loading, setLoading] = useState(false);
  const [isForwardModalOpen, setForwardModalOpen] = useState(false); 
  const [messageToForward, setMessageToForward] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_HOST}/api/v1/message/getMessages/${currentChatUser?.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.data);
        setLoading(false); 
      } catch (error) {
        toast.error("Something went wrong!");
        setLoading(false);
      }
    };

    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser, setMessages, user?.id]);


// Handle forward message logic
const handleForwardMessage = (message) => {
  setMessageToForward(message);
  setForwardModalOpen(true);
};

// Close the forward modal
const handleCloseForwardModal = () => {
  setForwardModalOpen(false);
  setMessageToForward(null);
};

// Delete Message function
const handleDeleteMessage = async (messageId, isDeleteForEveryone) => {
  const deleteUrl = isDeleteForEveryone
    ? `${process.env.NEXT_PUBLIC_HOST}/api/v1/message/deleteForEveryone/${messageId}`
    : `${process.env.NEXT_PUBLIC_HOST}/api/v1/message/deleteForMe/${messageId}`;

  try {
    const response = await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (isDeleteForEveryone) {
      socket.emit('delete-msg-for-everyone', { messageId, to: currentChatUser?.id });
    }
    if (response.status === 200) {
      setMessages(messages.filter((msg) => msg.id !== messageId));
      toast.success(isDeleteForEveryone ? "Message deleted for everyone." : "Message deleted from your chat.");
    }
  } catch (error) {
    toast.error("Failed to delete message.");
  }
};


  // Scroll to the first unread message or the latest message at the bottom
  useEffect(() => {
    if (messages.length > 0) {
      const unreadMessage = messages.find((msg) => msg.messageStatus !== 'read');
      if (unreadMessage) {
        const unreadMessageId = unreadMessage.id;
        if (messageRefs.current[unreadMessageId]) {
          messageRefs.current[unreadMessageId].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        const lastMessageId = messages[messages.length - 1]?.id;
        if (messageRefs.current[lastMessageId]) {
          messageRefs.current[lastMessageId].scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }
    }
  }, [messages]);

  useEffect(() => {
    if (selectedMessageId && messageRefs.current[selectedMessageId]) {
      messageRefs.current[selectedMessageId].scrollIntoView({ behavior: 'smooth', block: 'center' });

      const messageElement = messageRefs.current[selectedMessageId];
      messageElement.classList.add('bg-highlight');

      const timer = setTimeout(() => {
        messageElement.classList.remove('bg-highlight');
        setSelectedMessage(null);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedMessageId, setSelectedMessage]);

  const filteredMessages = messages.filter(
    (message) =>
      (message.senderId === currentChatUser.id && message.receiverId === user.id) ||
      (message.senderId === user.id && message.receiverId === currentChatUser.id)
  );

  
  return (
    loading ? (
      <div><Loading /></div>
    ) : (
      <div className="h-[80vh] w-full relative flex-grow overflow-auto custom-scrollbar">
        <div className="mx-4 my-6 relative bottom-0 z-40 left-0">
          <div className="flex w-full">
            <div className="flex flex-col justify-end w-full gap-4 overflow-auto">
              {filteredMessages.length === 0 ? (
                <div className="text-center text-gray-500">No messages to display.</div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    ref={(el) => (messageRefs.current[message.id] = el)}
                    className={`group flex ${message.senderId === currentChatUser.id ? 'justify-start' : 'justify-end'} gap-4 px-2`}
                  >
                    <div className="relative flex ">
                      {message.senderId === currentChatUser.id ? (
                        <>
                          <MessageBubble message={message} isGroup={false} />
                          <ChatActionIcons
                            message={message}
                            user={user}
                            onDeleteMessage={handleDeleteMessage}
                            onForwardMessage={() => handleForwardMessage(message)}
                          />
                        </>
                      ) : (
                        <>
                          <ChatActionIcons
                            message={message}
                            user={user}
                            onDeleteMessage={handleDeleteMessage}
                            onForwardMessage={() => handleForwardMessage(message)}
                          />
                          <MessageBubble message={message} isGroup={false}/>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Forward Message Modal */}
        {isForwardModalOpen && (
          <ForwardMessageModal
            isOpen={isForwardModalOpen}
            onClose={handleCloseForwardModal}
            message={messageToForward}
            userContacts={userContacts}
            groups={groups}
          />
        )}
      </div>
    )
  );
}

export default ChatContainer;
