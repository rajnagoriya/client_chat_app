import React from 'react';

function Loading() {
  return (
    <div className="flex items-center justify-center h-screen ">
      <span
        className="loading loading-spinner loading-lg"
        style={{ color: '#007d88' }}
      ></span>
    </div>
  );
}

export default Loading;
