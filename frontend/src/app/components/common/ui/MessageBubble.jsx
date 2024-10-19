import React from 'react';
import DownloadBtn from './DownloadBtn';
import MessageStatus from '../MessageStatus';
import { calculateTime } from '@/helpers/calculateTime';
import { AiOutlineFilePdf, AiOutlineFileUnknown, AiOutlineFileWord } from 'react-icons/ai';
import { useStateContext } from '@/providers/StateContext';

function MessageBubble({ message, isGroup }) {
  const { state } = useStateContext();
  const { currentChatUser, user } = state;

  // Helper functions to handle file types and downloads
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  const getDocumentIcon = (extension) => {
    switch (extension) {
      case 'pdf':
        return <AiOutlineFilePdf className="text-red-500 text-2xl" />;
      case 'doc':
      case 'docx':
        return <AiOutlineFileWord className="text-blue-500 text-2xl" />;
      default:
        return <AiOutlineFileUnknown className="text-gray-500 text-2xl" />;
    }
  };
  const isSender = isGroup? message.senderId != user.id :  message.senderId === currentChatUser.id
  return (
    <>
      <div>
        {/* Message Bubble */}
        <div
          className={`relative p-2 rounded-2xl shadow-sm flex flex-col gap-1 ${
            isSender
              ? 'bg-gray-800 text-white rounded-tl-none'
              : 'bg-[#007d88] text-white rounded-br-none'
          }`}
        >
            {
                isGroup && <div className='text-sm text-yellow-500'>{message.sender.username}</div>
            }
          {/* Message Content */}
          {message.type === 'text' && <span className="break-words">{message.message}</span>}

          {message.type === 'image' && (
            <div className="relative">
              <img
                src={`${process.env.NEXT_PUBLIC_HOST}/${message.message}`}
                alt="Sent Image"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className='flex justify-end items-center'>
              <DownloadBtn filePath={message.message} fileName={message.message.split('/').pop()} />
              </div>
            </div>
          )}

          {message.type === 'video' && (
            <div className="relative">
              <video controls className="w-full h-48 object-cover rounded-lg">
                <source src={`${process.env.NEXT_PUBLIC_HOST}/${message.message}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className='flex justify-end items-center'>
              <DownloadBtn filePath={message.message} fileName={message.message.split('/').pop()} />
              </div>
              
            </div>
          )}

          {message.type === 'audio' && (
            <div className="relative flex flex-col p-2 bg-base-200 rounded-lg shadow-md">
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-800">Audio Message</span>
                <div className='flex justify-end items-center'>
              <DownloadBtn filePath={message.message} fileName={message.message.split('/').pop()} />
              </div>
              </div>

              {/* Audio Player */}
              <audio controls className="w-full">
                <source src={`${process.env.NEXT_PUBLIC_HOST}/${message.message}`} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {message.type === 'application' && (
            <div className="relative flex items-center gap-2">
              {getDocumentIcon(getFileExtension(message.message))}
              <a
                href={`${process.env.NEXT_PUBLIC_HOST}/${message.message}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline break-all flex-grow"
              >
                {message.message.split('/').pop()} {/* Display filename */}
              </a>
              <div className='flex justify-end items-center'>
              <DownloadBtn filePath={message.message} fileName={message.message.split('/').pop()} />
              </div>
            </div>
          )}

          {/* Handle Unknown Message Types */}
          {!['text', 'image', 'video', 'audio', 'application'].includes(message.type) && (
            <span className="text-yellow-500">
              {message.type} Unsupported message type.
            </span>
          )}

          {/* Time & Message Status */}
          <div className="flex justify-end items-center text-xs gap-2 text-gray-300">
            <span className="text-[10px]">{calculateTime(message.createdAt)}</span>
            {message.senderId === user.id && <MessageStatus messageStatus={message.messageStatus} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default MessageBubble;
