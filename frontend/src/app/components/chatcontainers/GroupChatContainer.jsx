import { useStateContext } from "@/providers/StateContext";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ChatActionIcons from "../common/ChatActionIcons";
import Loading from "../common/Loading";
import ForwardMessageModal from "../common/modals/ForwardMessageModal";
import MessageBubble from "../common/ui/MessageBubble";


function GroupChatContainer() {
  const { state, setSelectedMessage, setGroupMessages, resetUnread } = useStateContext();
  const { currentGroup, user, groupMessages, selectedMessageId, socket, groups, userContacts } = state;

  const token = Cookies.get("chatAppToken");

  const messageRefs = useRef({}); 

  const [loading, setLoading] = useState(false);
  const [isForwardModalOpen, setForwardModalOpen] = useState(false); 
  const [messageToForward, setMessageToForward] = useState(null);


  // Handle forward message logic
  const handleForwardMessage = (message) => {
    setMessageToForward(message); 
    setForwardModalOpen(true);
  };

  // Close the forward 
  const handleCloseForwardModal = () => {
    setForwardModalOpen(false);
    setMessageToForward(null);
  };


  // Delete message logic
  const handleDeleteMessage = async (messageId, isDeleteForEveryone) => {
    if (!currentGroup || !messageId) return;

    const deleteUrl = isDeleteForEveryone
      ? `${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/message/${messageId}/delete-for-everyone`
      : `${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/message/${messageId}/delete-for-me`;

    try {
      setLoading(true);
      const response = await axios.delete(deleteUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isDeleteForEveryone) {
        socket.emit('delete-group-msg-for-everyone', { groupId: currentGroup.id, messageId });
      }
      if (response.status === 200) {
        setGroupMessages(groupMessages.filter((msg) => msg.id !== messageId));
        toast.success(isDeleteForEveryone ? "Message deleted for everyone." : "Message deleted from your chat.");
      }
    } catch (error) {
      toast.error("Failed to delete message.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch group messages
  useEffect(() => {
    if (currentGroup) {
      const fetchMessages = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 200) {
            setGroupMessages(response.data.data.messages);
          }
        } catch (error) {
          toast.error("something went wrong !!");
        }finally {
          setLoading(false);
        }
      };

      fetchMessages();

      const markAsRead = async () => {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/mark-as-read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.status === 200) {
            resetUnread(currentGroup.id);
          }
        } catch (error) {
          toast.error("something went wrong !!");
        }
      };

      markAsRead();
    }
  }, [currentGroup, token, setGroupMessages, resetUnread]);

  useEffect(() => {
    if (groupMessages.length > 0) {
       const unreadMessage = groupMessages.find((msg) => !msg.readAt); // Unread message logic
       if (unreadMessage) {
         const unreadMessageId = unreadMessage.id;
         if (messageRefs.current[unreadMessageId]) {
           messageRefs.current[unreadMessageId].scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
       } else {
         const lastMessageId = groupMessages[groupMessages.length - 1]?.id;
         if (messageRefs.current[lastMessageId]) {
           messageRefs.current[lastMessageId].scrollIntoView({ behavior: 'smooth', block: 'end' });
         }
       }
    }
  }, [groupMessages]);

  // Effect to scroll to the selected message
  useEffect(() => {
    if (selectedMessageId && messageRefs.current[selectedMessageId]) {
      messageRefs.current[selectedMessageId].scrollIntoView({ behavior: "smooth", block: "center" });

      const messageElement = messageRefs.current[selectedMessageId];
      messageElement.classList.add("bg-highlight");

      const timer = setTimeout(() => {
        messageElement.classList.remove("bg-highlight");
        setSelectedMessage(null);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [selectedMessageId, setSelectedMessage]);

  const filteredMessages = groupMessages?.filter((message) => message.groupId === currentGroup.id);

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
                  className={`group relative flex gap-4 px-2 ${
                    message.senderId === user.id ? "justify-end" : "justify-start"
                  }`}
                >
                  
                      <div className="relative flex">
                        {
                          message.senderId != user.id ? (
                            <>
                              <MessageBubble message={message} isGroup={true} />
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
                              <MessageBubble message={message} isGroup={true}/>
                            </>
                          )
                        }
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

export default GroupChatContainer;