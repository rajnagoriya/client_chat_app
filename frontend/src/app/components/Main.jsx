"use client"; 
import { useStateContext } from '@/providers/StateContext';
import Empty from './Empty';
import Chat from './MainChat/Chat';
import SearchMessages from './MainChat/SearchMessages';
import ChatList from './SideBar/ChatList';

export default function Main() {
  const { 
    state, 
  } = useStateContext();
  const { 
    currentChatUser,  
    searchMessagesOpen, 
    currentGroup, 
    isSmallAndChatOpen, 
    isSmallscreen,
    user 
  } = state;

if(!user){
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