import { useStateContext } from "@/providers/StateContext";
import axios from "axios";
import Cookies from 'js-cookie';
import { useEffect } from "react";
import toast from "react-hot-toast";
import ListItem from '../common/ListItem';

export default function ContactsList() {
  const { state, setOnlineUsers, setUserContacts } = useStateContext();
  const { user, messages, userContacts, filteredContacts } = state;

  useEffect(() => {
    const getContacts = async () => {
      try {
        const token = Cookies.get("chatAppToken");
        const response = await 
        axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/v1/message/getInitialContacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { users, onlineUsers } = response.data.data;
        setUserContacts(users);
        setOnlineUsers(onlineUsers);
      } catch (err) {
        toast.error("something went wrong !!!");
      }
    };

    if (user?.id) {
      getContacts();
    }
  }, [user, setUserContacts, setOnlineUsers,messages]);

  return (
    <div className="
    bg-search-input-container-background 
    flex-auto 
    overflow-auto 
    max-h-full 
    custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => (
            <ListItem key={contact.id} item={contact} type="chat" />
          ))
        : userContacts.map((contact) => (
            <ListItem key={contact.id} item={contact} type="chat" />
          ))
      }
    </div>
  );
}