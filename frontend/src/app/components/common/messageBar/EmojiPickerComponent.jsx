
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from 'react-icons/bs';

function EmojiPickerComponent({ showEmojiPicker, toggleEmojiPicker, addEmoji }) {
  return (
    <div className="relative">
      <BsEmojiSmile
        className="text-panel-header-icon cursor-pointer text-xl"
        title="Emoji"
        onClick={toggleEmojiPicker}
      />
      {showEmojiPicker && (
        <div className="absolute bottom-[120%] left-0 bg-base-100 rounded-lg shadow-lg z-50 overflow-hidden w-80">
          <EmojiPicker onEmojiClick={addEmoji} theme="dark" />
        </div>
      )}
    </div>
  );
}

export default EmojiPickerComponent;
