import { useStateContext } from '@/providers/StateContext';
import axios from 'axios'; 
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaPen, FaPlus } from 'react-icons/fa';
import AddUsers from './modals/AddUsers';
import Avatar from './profile/Avatar';
import ContextMenu from './modals/ContextMenu';
import EditGroupInfo from './modals/EditGroupInfo';

function InfoBar() {
  const token = Cookies.get("chatAppToken");
  const { state, setIsInfoOpen, setCurrentChatUser, setCurrentGroup } = useStateContext();
  const { isInfoOpen, user, currentChatUser, currentGroup } = state;

  const avatarUrl = currentGroup
    ? `${process.env.NEXT_PUBLIC_HOST}/${currentGroup.avatar}`
    : currentChatUser.profilePicture
    ? `${process.env.NEXT_PUBLIC_HOST}/${currentChatUser.profilePicture}`
    : '';

  const [image, setImage] = useState(avatarUrl);
  const [groupMembers, setGroupMembers] = useState([]); 
  const [contextMenu, setContextMenu] = useState(false); 
  const [contextMenuOptions, setContextMenuOptions] = useState([]); 
  const [contextMenuCoordinates, setContextMenuCoordinates] = useState({ x: 0, y: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddUser, setIsAddUser] = useState(false);
  const [isInfoEdit, setIsInfoEdit] = useState(false);


  // Fetch group members
  useEffect(() => {
    const fetchGroupMember = async () => {
      try {
        const response = await 
        axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/groupMember/${currentGroup.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroupMembers(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch group info !!");
      }
    };
    if (currentGroup?.id) {
      fetchGroupMember();
    }
  }, [currentGroup]);


  // Function to remove a user
  const removeUser = async (member) => {
    try {
     const response = await axios.delete(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { adminId: currentGroup.adminId, userId: member.user.id },
      });
      toast.success('User removed successfully');
      setGroupMembers(groupMembers.filter((m) => m.user.id !== member.user.id));
      setContextMenu(false); // Close the context menu after action
    } catch (error) {
      console.log("error in infobar remove "+error);
      toast.error('Failed to remove user');
    }
  };

  // Open chat with a selected user
  const openChat = (member) => {
    setCurrentChatUser(member.user); 
    setCurrentGroup(null);
    setIsInfoOpen(false);
    setContextMenu(false);
  };

  // Open the context menu with options
  const handleContextMenu = (e, member) => {
    e.preventDefault();
    // setSelectedUser(member); // Track the selected user

    const options = [
      { name: 'Chat', callBack: () => openChat(member) }, // Chat option available to all
    ];

    // Add "Remove User" option 
    if (currentGroup.adminId === user.id && member.user.id !== user.id) {
      options.push({ name: 'Remove User', callBack: () => removeUser(member) });
    }

    setContextMenuCoordinates({ x: e.clientX, y: e.clientY });
    setContextMenuOptions(options);
    setContextMenu(true);
  };


  const closeIsAddUser = () => {
    setIsAddUser(false);
  }

  const closeIsInfoEdit = () =>{
    setIsInfoEdit(false);
    setIsInfoOpen(false)
  }

  return (
    <div className="drawer drawer-end overflow-scroll z-50">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" checked={isInfoOpen} readOnly />

      <div className="drawer-side">
        <label htmlFor="
        my-drawer-4" 
        aria-label="close sidebar" 
        className="drawer-overlay"></label>
        <div className="
        flex 
        flex-col 
        bg-conversation-panel-background 
        text-white 
        min-w-[300px] 
        fixed h-full">

          <div className="
          sticky 
          top-0 flex 
          items-center 
          gap-6 p-6 
          bg-conversation-panel-background 
          z-10">
            <button
              aria-label="close sidebar"
              className="text-panel-header-icon"
              onClick={() => setIsInfoOpen(false)}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-xl">Info</h2>
          </div>
          {
           currentGroup && currentGroup.adminId === user.id && (
            <div className='flex justify-between items-center p-7'>
              <span>Edit Info</span>
              <span>
                <FaPen className="
                ml-2 
                text-panel-header-icon 
                cursor-pointer" onClick={() => setIsInfoEdit(!isInfoEdit)} />
              </span>
            </div>
            )
          }
        
         
          <div className="flex-grow overflow-y-auto p-6">
            <div className="flex flex-col items-center mb-6">
               <Avatar 
            type="infoIcon" 
            image={image} 
            className="rounded-full" 
          />
            </div>

            <div className="text-center mb-4">
              <input
                type="text"
                value={currentChatUser?.username || currentGroup?.name}
                placeholder="User Name"
                readOnly
                className="
                text-center 
                text-2xl 
                font-bold 
                bg-transparent 
                text-white 
                border-none 
                w-full 
                focus:outline-none"
              />
            </div>

            <div className="text-center mb-6">
              <textarea
                value={currentChatUser?.about || currentGroup?.about || ""}
                placeholder="About...."
                readOnly
                className="
                text-sm 
                text-gray-400 
                bg-gray-800 
                rounded-lg border 
                border-gray-600 
                p-4 w-full 
                focus:outline-none"
              />
            </div>

            {currentChatUser && (
              <div className="text-center mb-6">
                <input
                  type="email"
                  value={currentChatUser?.email || ''}
                  placeholder="Email Address"
                  readOnly
                  className="
                  text-sm 
                  text-gray-400 
                  bg-gray-800 
                  rounded-lg border 
                  border-gray-600 
                  p-3 w-full 
                  text-center 
                  focus:outline-none"
                />
              </div>
            )}

            {currentGroup && (
              <div className="text-center mb-6 gap-6">
                <div className='flex justify-between items-center p-4'>
                <h4 className="text-lg font-semibold mb-3">Group Members</h4>
                {currentGroup.adminId === user.id && (
                  <span className='
                  p-3 
                  bg-[#007d88] 
                  rounded-full
                  cursor-pointer
                  ' 
                  onClick={(e)=>{
                    setIsAddUser(true);
                  }}><FaPlus/></span>
                )}
                </div>
                <ul>
                  {groupMembers.map((member) => (
                    <li key={member.user?.id} className="
                    flex 
                    justify-between 
                    items-center 
                    mb-4 
                    cursor-pointer 
                    p-2" onClick={(e) => handleContextMenu(e, member)} >
                    
                      <div className="flex items-center gap-3">
                        <Avatar 
                        type="lg"
                        image={`${process.env.NEXT_PUBLIC_HOST}/${member.user?.profilePicture}`}/>
                        <div className='flex flex-col text-start'>
                          <p className="font-bold text-sm">{member.user?.username}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[150px]">
                            {member.user?.about ? member.user?.about.slice(0, 25) : 'No description'}
                          </p>
                        </div>
                      </div>

                      {
                        currentGroup?.adminId === member?.user?.id && (
                          <div className="badge badge-outline">admin</div>
                        )
                      }
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          options={contextMenuOptions}
          coordinates={contextMenuCoordinates} 
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
      )}
      {isAddUser && <AddUsers onClose={closeIsAddUser} groupMembers={groupMembers} />}
      {isInfoEdit && <EditGroupInfo onClose={closeIsInfoEdit}  />}
    </div>
  );
}

export default InfoBar;
