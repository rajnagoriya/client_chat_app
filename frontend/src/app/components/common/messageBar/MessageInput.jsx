
function MessageInput({ message, setMessage, disabled }) {
  return (
    <div className="w-full rounded-lg h-10 flex items-center">
      <input
        type="text"
        placeholder="Type a message"
        className="bg-input-background text-sm focus:outline-none text-white h-10 rounded-lg pl-5 pr-5 py-4 w-full disabled:opacity-50"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

export default MessageInput;
