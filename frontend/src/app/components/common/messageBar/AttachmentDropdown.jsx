// src/components/AttachmentDropdown.jsx
import { AiOutlineAudio, AiOutlineFile, AiOutlineVideoCamera } from 'react-icons/ai';
import { ImAttachment } from 'react-icons/im';
import { IoDocumentTextOutline } from 'react-icons/io5';

function AttachmentDropdown({ showDropdown, toggleDropdown, handleFileSelect }) {
  return (
    <div className="relative">
      <ImAttachment
        className="text-panel-header-icon cursor-pointer text-xl"
        title="Attach File"
        onClick={toggleDropdown}
      />
      {showDropdown && (
        <div className="absolute bottom-[120%] left-0 bg-base-100 rounded-lg shadow-lg p-2 z-50 w-48">
          <label className="cursor-pointer flex items-center gap-2" htmlFor="image-upload">
            <AiOutlineFile /> Image
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
          <label className="cursor-pointer flex items-center gap-2" htmlFor="audio-upload">
            <AiOutlineAudio /> Audio
            <input
              type="file"
              id="audio-upload"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
          <label className="cursor-pointer flex items-center gap-2" htmlFor="video-upload">
            <AiOutlineVideoCamera /> Video
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
          <label className="cursor-pointer flex items-center gap-2" htmlFor="document-upload">
            <IoDocumentTextOutline /> PDF/Doc
            <input
              type="file"
              id="document-upload"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default AttachmentDropdown;
