import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";

function MessageStatus({ messageStatus }) {
  return (
    <>
      {messageStatus === "sent" && <BsCheck className="text-white text-lg" />}
      {messageStatus === "delivered" && <BsCheckAll className="text-white text-lg" />}
      {messageStatus === "read" && (
        <BsCheckAll className="text-blue-900 text-lg" /> 
      )}
    </>
  );
}

export default MessageStatus;
