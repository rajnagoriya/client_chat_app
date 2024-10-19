import { useStateContext } from '@/providers/StateContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BiSearchAlt2 } from 'react-icons/bi';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { IoArrowBack } from 'react-icons/io5';
import ContextMenu from '../modals/ContextMenu';
import Avatar from '../profile/Avatar';

function ChatHeader() {
  const { 
    state, 
    setSearchMessagesOpen, 
    setGroups,
    setIsInfoOpen, 
    setCurrentGroup, 
    setCurrentChatUser,
    setGroupMessages,
    setUserContacts,
    setIsSmallAndChatOpen 
  } = useStateContext();

  const { 
    currentChatUser, 
    onlineUsers, 
    currentGroup, 
    groups,
    isSmallscreen, 
    userContacts 
  } = state;

  const [contextMenu, setContextMenu] = useState(false);
  const [contextMenuOptions, setContextMenuOptions] = useState([]);
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({ x: 0, y: 0 });

  const token = Cookies.get('chatAppToken');

  const avatarUrl = currentGroup
    ? `${process.env.NEXT_PUBLIC_HOST}/${currentGroup.avatar}`
    : currentChatUser?.profilePicture
      ? `${process.env.NEXT_PUBLIC_HOST}/${currentChatUser.profilePicture}`
      : '';

  const name = currentGroup ? currentGroup.name : currentChatUser?.username || '';
  const isOnline = currentChatUser ? onlineUsers.includes(currentChatUser.id) : false;

  

  const isSearchMessagesHandle = () => {
    setSearchMessagesOpen(!state.searchMessagesOpen);
  };

  // Handle the context menu when three dots are clicked
  const showContextMenu = (e) => {
    e.preventDefault();
    setContextMenuCoordinates({ x: e.clientX, y: e.clientY }); // Set context menu position

    const options = [
      { name: 'Clear Chat', callBack: currentChatUser? handleClearChat : handleGroupChatClear },
    ];

    if (currentGroup?.adminId === state.user?.id) {
      options.push({ name: 'Delete Group', callBack: handleDeleteGroup  });
    }

    setContextMenuOptions(options);
    setContextMenu(true); // Show the context menu
  };

  const handleClearChat = async () => {
    try {
      if (currentChatUser) {
        await axios.delete(`${process.env.NEXT_PUBLIC_HOST}/api/v1/message/clear/${currentChatUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserContacts(userContacts.filter((contact) => currentChatUser.id !== contact.id));
        toast.success('Chat cleared successfully');
        setCurrentChatUser(null);
      }
    } catch (error) {
      toast.error('Failed to clear chat');
      console.error('Error clearing chat:', error);
    }
    setContextMenu(false); // Close the context menu
  };

  const handleGroupChatClear = async () => {
    try {
      if (currentGroup) {
        await axios.delete(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/messages/clear`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupMessages([]);
        toast.success('Clear chat successfully');
      }
    } catch (error) {
      toast.error('Failed to clear chat');
      console.error('Error clear group chat :', error);
    }
    setContextMenu(false);
  };

  const handleDeleteGroup = async () => {
    try {
      if (currentGroup) {
        await axios.delete(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(groups.filter((group) => currentGroup.id !== group.id));
        toast.success('Group deleted successfully');
        setCurrentGroup(null);
        setCurrentChatUser(null);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Failed to delete group');
    }
    setContextMenu(false);
  };

  const handleBackClick = () => {
    setIsSmallAndChatOpen(false); // Set to false to show ChatList again
  };

  return (
    <div className="
            h-16 px-4 py-3 
            flex justify-between 
            items-center 
            bg-panel-header-background z-10
        ">
      <div className="flex items-center gap-6">
        {isSmallscreen && (
          <IoArrowBack className="text-2xl cursor-pointer" onClick={handleBackClick} />
        )}
        <div onClick={()=>setIsInfoOpen(true)} className='flex items-center gap-6 cursor-pointer'>
        <Avatar type="sm" image={avatarUrl}  />
        <div className="flex flex-col">
          <span className='text-primary-strong'> {name} </span>
          {currentChatUser && <span className='text-secondary text-sm'>{isOnline ? "Online" : "Offline"}</span>}
        </div>
        </div>
      </div>
      <div className="flex gap-6">
        <BiSearchAlt2 className="text-panel-header-icon cursor-pointer text-xl" onClick={isSearchMessagesHandle} />
        <BsThreeDotsVertical className="text-panel-header-icon cursor-pointer text-xl" onClick={showContextMenu} id="context-opener" />
      </div>

      {contextMenu && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCoordinates}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
      )}
    </div>
  );
}

export default ChatHeader;