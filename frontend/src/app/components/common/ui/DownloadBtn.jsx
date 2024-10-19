import React from 'react'
import toast from 'react-hot-toast';
import { FaDownload } from 'react-icons/fa';

function DownloadBtn({filePath,fileName}) {

    const handleDownload = async (filePath, fileName) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_HOST}/${filePath}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/octet-stream' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download file.');
        }
    };

  return (
    <div>
        <button
                        onClick={() => handleDownload(filePath, fileName)}
                        className="
                        ml-2 
                        bg-gray-800 
                        bg-opacity-75 
                        text-white 
                        rounded-full 
                        p-1 
                        hover:bg-opacity-90"
                        title="Download File"
                        aria-label="Download File"
                      >
                        <FaDownload />
                      </button>
    </div>
  )
}

export default DownloadBtn