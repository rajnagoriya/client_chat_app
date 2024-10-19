import { useStateContext } from "@/providers/StateContext";
import axios from "axios";
import Cookies from "js-cookie";
import { useState } from "react";
import toast from "react-hot-toast";

const ForwardMessageModal = ({ isOpen, onClose, message, userContacts, groups }) => {
  const { state,setAddMessage } = useStateContext();
  // const { user, socket } = state;

  const [selectedTargets, setSelectedTargets] = useState([]);
  const token = Cookies.get("chatAppToken");

  const handleToggleTarget = (el, isGroup) => {
    const target = { id: el.id, isGroup };
    setSelectedTargets((prev) =>
      prev.some((t) => t.id === el.id && t.isGroup === isGroup)
        ? prev.filter((t) => t.id !== el.id || t.isGroup !== isGroup)
        : [...prev, target]
    );
  };

  const handleForward = async () => {
    if (!message || selectedTargets.length === 0) return;

    const payload = {
      messageId: message.id,
      messageType: message.groupId ? "group" : "private",
      targets: selectedTargets,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOST}/api/v1/message/forward`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        // add msg to state for reflect in our ui 
        const newMessages = response.data.data;
        newMessages.map((message)=> setAddMessage(message.message));
        toast.success("Message forwarded successfully!");
        onClose();
      }
    } catch (error) {
      toast.error("Failed to forward message.");
      console.error("Forward message error:", error);
    }
  };

  return (
    isOpen && (
      <div className="
      fixed 
      inset-0 
      z-50 flex 
      items-center 
      justify-center 
      bg-black 
      bg-opacity-50"
      >
        <div className="
        modal-box 
        relative 
        bg-gray-800 
        p-6 rounded-lg 
        shadow-lg 
        w-full max-w-md">
          <label
            className="
            btn btn-sm 
            btn-circle 
            absolute 
            right-2 top-2"
            onClick={onClose}
          >
            ✕
          </label>
          <h2 className="
          text-xl 
          font-bold 
          text-white 
          mb-4"
          >Forward Message</h2>

          {/* User Contacts */}
          <div className="form-control">
            <h3 className="
            text-md 
            font-semibold 
            text-white"
            >Forward to Contacts</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto mt-2">
              {userContacts.map((contact) => (
                <div key={contact.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="checkbox border-[#007d88]"
                    checked={selectedTargets.some(
                      (t) => t.id === contact.id && !t.isGroup
                    )}
                    onChange={() => handleToggleTarget(contact, false)}
                  />
                  <span className="text-white">{contact.username}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="form-control mt-4">
            <h3 className="text-md font-semibold text-white">Forward to Groups</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto mt-2">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="checkbox  border-[#007d88]"
                    checked={selectedTargets.some(
                      (t) => t.id === group.id && t.isGroup
                    )}
                    onChange={() => handleToggleTarget(group, true)}
                  />
                  <span className="text-white">{group.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action mt-6 flex justify-end space-x-2">
            <button className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button className="btn bg-[#007d88]" onClick={handleForward}>
              Forward
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ForwardMessageModal;