// ChatListHeader.jsx
import { useStateContext } from '@/providers/StateContext';
import { useState } from 'react';
import { BsFillChatLeftTextFill, BsThreeDotsVertical } from 'react-icons/bs';
import CreateGroupModal from '../modals/CreateGroupModal';
import Avatar from '../profile/Avatar';

function ChatListHeader() {
  const { state, setContactSearchPage, setChangeProfile } = useStateContext();
  const { user } = state;

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const handleAvatarClick = () => {
    setChangeProfile(true); // Open the drawer when avatar is clicked
  };

  const handleSearchContactsPage = () => {
    setContactSearchPage(true); // Open when the new chat icon is clicked
  };

  const handleCreateGroup = () => {
    setIsCreateGroupOpen(true);
  };

  const closeCreateGroupModal = () => {
    setIsCreateGroupOpen(false);
  };

  return (
    <div className="h-16 px-4 py-3 flex justify-between items-center w-full bg-panel-header-background">
      <div className="cursor-pointer" onClick={handleAvatarClick}>
        <Avatar
          type="sm"
          image={
            user?.profilePicture
              ? `${process.env.NEXT_PUBLIC_HOST}/${user?.profilePicture}`
              : ''
          }
        />
      </div>
      <div className="flex gap-6 relative">
        <BsFillChatLeftTextFill
          className="text-panel-header-icon cursor-pointer text-xl"
          title="New chat"
          onClick={handleSearchContactsPage}
        />
        {/* Daisy UI Dropdown */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="cursor-pointer text-panel-header-icon text-xl">
            <BsThreeDotsVertical title="Menu" />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button onClick={handleCreateGroup}>Create Group</button>
            </li>
          </ul>
        </div>
      </div>
      {isCreateGroupOpen && <CreateGroupModal onClose={closeCreateGroupModal} />}
    </div>
  );
}

export default ChatListHeader;