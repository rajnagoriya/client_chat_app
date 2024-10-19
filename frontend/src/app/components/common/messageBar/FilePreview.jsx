import { FaTimes } from 'react-icons/fa';

function FilePreview({ fileType, filePreview, selectedFile, onRemove }) {
  return (
    <div className="relative">
      {fileType === 'image' && (
        <img src={filePreview} alt="Preview" className="w-full h-auto object-cover rounded-lg" />
      )}

      {fileType === 'video' && (
        <video controls className="w-full h-auto rounded-lg">
          <source src={filePreview} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {fileType === 'audio' && (
        <audio controls className="w-full">
          <source src={filePreview} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      {fileType === 'application' && (
        <>
          {selectedFile.type === 'application/pdf' ? (
            <iframe
              src={filePreview}
              title="PDF Preview"
              className="w-full h-48 rounded-lg"
            ></iframe>
          ) : (
            <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
              <span>{selectedFile.name}</span>
            </div>
          )}
        </>
      )}
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white rounded-full p-1 hover:bg-opacity-90"
        title="Remove File"
      >
        <FaTimes />
      </button>
    </div>
  );
}

export default FilePreview;
