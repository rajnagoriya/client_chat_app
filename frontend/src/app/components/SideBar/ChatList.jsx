import { useState } from 'react';
import { useStateContext } from '../../../providers/StateContext';
import ChatListHeader from '../common/headers/ChatListHeader';
import ContactsList from '../lists/ContactsList';
import GroupList from '../lists/GroupList';
import ChangeProfile from './ChangeProfile';
import SearchBar from './SearchBar';
import SearchNewUsers from './searchNewUsers';

function ChatList() {
  const { state } = useStateContext();
  const { contactSearchPage, changeProfile } = state;
 
  const [isGroupSelected, setIsGroupSelected] = useState("contacts");


  return (
    <div className="relative flex flex-col max-h-screen w-full">
      {contactSearchPage ? (
        <SearchNewUsers />
      ) : (
        <>
          {changeProfile ? (
            <div className="w-full h-full">
              <ChangeProfile />
            </div>
          ) : (
            <>
              <ChatListHeader />
              <div className='flex flex-col text-center justify-around'>
              <SearchBar />
              <div className='bg-search-input-container-background flex justify-around cursor-pointer '>
                <span 
                onClick={()=>setIsGroupSelected("contacts")} 
                className={isGroupSelected === "contacts" 
                ?"text-white border-b-2 border-b-[#007d88] rounded-sm"
                :''}>Contacts</span>
                <span onClick={()=>setIsGroupSelected("groups")}
                className={isGroupSelected === "groups" 
                ?"text-white border-b-2 border-b-[#007d88]"
                :''}>Groups</span>
              </div>
              </div>
              {
                isGroupSelected === "contacts" 
                ? <ContactsList />
                : <GroupList/>
              }
              
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ChatList;
