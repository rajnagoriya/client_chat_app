import React from 'react';
import Avatar from './profile/Avatar';
import { useStateContext } from '@/providers/StateContext';
import { calculateTime } from '@/helpers/calculateTime';
import MessageStatus from '../common/MessageStatus';
import { FaCamera, FaFile, FaMicrophone, FaVideo } from 'react-icons/fa';

function ListItem({ item, type }) {
  const { 
    state, 
    setCurrentChatUser, 
    setCurrentGroup, 
    setContactSearchPage,
    setIsSmallAndChatOpen 
  } = useStateContext();
  const { 
    user, 
    contactSearchPage, 
    onlineUsers 
  } = state;

  const handleClick = () => {
    if (type === 'group') {
      setCurrentGroup(item);
      setIsSmallAndChatOpen(true);
      setCurrentChatUser(null);
    } else if (type === 'chat') {
      setCurrentChatUser(item);
      setIsSmallAndChatOpen(true);
      setCurrentGroup(null);
      setContactSearchPage(false);
    }
  };

  const isOnline = type === 'chat' ? onlineUsers.includes(item.id) : false;
  const avatarUrl = item.avatar
    ? `${process.env.NEXT_PUBLIC_HOST}/${item.avatar.replace(/\\/g, '/')}`
    : item.profilePicture
    ? `${process.env.NEXT_PUBLIC_HOST}/${item.profilePicture.replace(/\\/g, '/')}`
    : '';

  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer items-center relative`}
    >
      <div className=" px-5 pt-3 pb-1 relative">
        <Avatar 
         type={type==='chat'?"lg":"gi"}
          image={avatarUrl} 
          isOnline={type === 'chat' && isOnline}
        />
      </div>
      <div className="min-h-full flex flex-col justify-center mt-3 pr-2 w-[75%]">
        <div className="flex justify-between">
          <div className="flex items-center">
            <span className="text-white">
              {type === 'group' ? item.name : item.username}
            </span>
          </div>
          {type === 'chat' ?(
                        !contactSearchPage && (
                            <div>
                                <span className={
                                    `${item.totalUnreadMessages > 0 
                                        ? "text-[#007d88]" 
                                        : "text-secondary"
                                    }  
                                    text-sm`}>
                                    {calculateTime(item.createdAt)}
                                </span>
                            </div>
                        ))
                        : ( !contactSearchPage && (
                          <div>
                            <span className={item.unreadCount > 0 ? 'text-[#007d88]' : 'text-secondary text-sm'}>
                            {
                            item.lastMessageTime?calculateTime(item?.lastMessageTime):''
                            }
                            </span>
                          </div>
                        ))
                    }
        </div>
        <div className="flex border-b border-conversation-border pb-2 pt-1 pr-2">
          <div className="flex justify-between w-full">
            <span className="text-secondary line-clamp-1 text-sm w-1/2">
              {contactSearchPage
                ? item.about || "\u00A0"
                : (
                  <div className='
                  flex 
                  items-center 
                  gap-1 
                  max-w-[200px] 
                  sm-w-[250px] 
                  md:max-w-[360px] 
                  lg:max-w-[200px] 
                  xl:max-w-[300px]'>
                    {item && (
                      <>
                        {item.senderId === user.id && <MessageStatus messageStatus={item.messageStatus} />}
                        {item.type === 'text' && <span className='truncate'>{item.message}</span>}
                        {item.type === 'audio' && (
                          <span className='flex gap-1 items-center'>
                            <FaMicrophone className='text-panel-header-icon' />
                            Audio
                          </span>
                        )}
                        {item.type === 'image' && (
                          <span className='flex gap-1 items-center'>
                            <FaCamera className='text-panel-header-icon' />
                            Image
                          </span>
                        )}
                        {item.type === 'video' && (
                          <span className='flex gap-1 items-center'>
                            <FaVideo className='text-panel-header-icon' />
                            Video
                          </span>
                        )}
                        {item.type === 'application' && (
                          <span className='flex gap-1 items-center'>
                            <FaFile className='text-panel-header-icon' />
                            File
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
            </span>
            <span className=' flex justify-center items-center'>
            { type === 'chat' ? (
                            item.totalUnreadMessages > 0 && (
                                <span className='bg-[#007d88] px-[5px] rounded-full text-sm text-white'>
                                    {item.totalUnreadMessages}
                                </span>
                            ))
                            :(item.unreadCount > 0 && (
                              <span className='bg-[#007d88] px-[5px] rounded-full text-sm text-white'>
                                {item.unreadCount}
                              </span>
                            ))
                        }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListItem;