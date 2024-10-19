"use client";
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { MdSend } from 'react-icons/md';

function SendButton({ hasContent, sendMessage, isRecording, startRecording, stopRecording }) {
  return (
    <div className="w-10 flex items-center justify-center">
      {hasContent ? (
        <button onClick={sendMessage}>
          <MdSend className="text-panel-header-icon cursor-pointer text-xl" />
        </button>
      ) : isRecording ? (
        <button onClick={stopRecording}>
          <FaStop className="text-red-600 cursor-pointer text-xl" title="Stop Recording" />
        </button>
      ) : (
        <button onClick={startRecording}>
          <FaMicrophone className="text-panel-header-icon cursor-pointer text-xl" title="Record" />
        </button>
      )}
    </div>
  );
}

export default SendButton;

