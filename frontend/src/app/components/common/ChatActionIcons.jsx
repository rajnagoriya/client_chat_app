import React from "react";
import { AiOutlineDelete, AiOutlineForward } from "react-icons/ai";

function ChatActionIcons({ message, user, onDeleteMessage, onForwardMessage }) {

  const isSender =
    (message.senderId && message.senderId === user.id) || 
    (message.sender && message.sender.id === user.id); 
  return (
    <div className="
    flex 
    flex-col 
    gap-2 
    justify-start
    opacity-0 
    group-hover:opacity-100 
    transition-opacity 
    duration-200
    p-0.5">
      {isSender ? (
        <>
      <span 
        onClick={() => onDeleteMessage(message.id, true)} 
        className=" text-sm cursor-pointer flex gap-1"
        >
          <AiOutlineDelete
          className="text-red-500 text-xl cursor-pointer hover:scale-110"
        />
          Delete for Everyone
      </span>
      <span 
        onClick={() => onDeleteMessage(message.id, false)} 
        className=" text-sm cursor-pointer flex gap-1"
        >
           <AiOutlineDelete
          className="text-orange-500 text-xl cursor-pointer hover:scale-110"
        />
         Delete for Me
      </span>
        </>
      ) : (

        <span 
        onClick={() => onDeleteMessage(message.id, false)} 
        className=" text-sm cursor-pointer flex gap-1"
        >
           <AiOutlineDelete
          className="text-orange-500 text-xl cursor-pointer hover:scale-110"
        />
         Delete for Me
      </span>
      )}

<span 
        onClick={() => onForwardMessage(message.id)} 
        className=" text-sm cursor-pointer flex gap-1"
        >
            <AiOutlineForward
        className="text-blue-500 text-xl cursor-pointer hover:scale-110"
      />
         Forward Message
      </span>
    </div>
  );
}

export default ChatActionIcons;