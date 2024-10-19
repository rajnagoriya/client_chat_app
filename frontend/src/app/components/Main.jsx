"use client"; 
import { useStateContext } from '@/providers/StateContext';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import Empty from './Empty';
import Chat from './MainChat/Chat';
import SearchMessages from './MainChat/SearchMessages';
import ChatList from './SideBar/ChatList';

export default function Main() {
  const { 
    state, 
    setsSmallAndChatOpen, 
    setIsSmallscreen 
  } = useStateContext();

  const { 
    currentChatUser, 
    user, 
    searchMessagesOpen, 
    currentGroup, 
    isSmallAndChatOpen, 
    isSmallscreen 
  } = state;

  // Function to handle screen size changes
  const handleResize = () => {
    if (window.innerWidth <= 1024) { 
      setIsSmallscreen(true);
    } else {
      setIsSmallscreen(false);
    }
  };

  // Use effect to listen for window resize
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  if (!user) {
    // router.push("/login");
    return ;
  }

  return (
    <div className={`grid h-screen w-screen max-h-screen max-w-full overflow-hidden 
      ${isSmallscreen ? 'grid-cols-1' : 'grid-cols-[30%_70%]'}
    `}>
      {!isSmallscreen ? (
        <>
          <ChatList />
          <div className={searchMessagesOpen ? "grid grid-cols-2" : "grid-cols-1"}>
            {(currentGroup || currentChatUser) ? (
              <>
                <Chat />
                {searchMessagesOpen && <SearchMessages />}
              </>
            ) : (
              <Empty />
            )}
          </div>
        </>
      ) : (
        <>
          {!isSmallAndChatOpen ? (
            <ChatList />
          ) : (
            <div className={searchMessagesOpen ? "grid grid-cols-2" : "grid-cols-1"}>
              {(currentGroup || currentChatUser) ? (
                <>
                  <Chat />
                  {searchMessagesOpen && <SearchMessages />}
                </>
              ) : (
                <Empty />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
