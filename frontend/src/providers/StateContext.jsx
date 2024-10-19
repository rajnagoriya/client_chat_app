// providers/StateContext.jsx

import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Define initial state
const initialState = {
  user: null,
  contactSearchPage: false,
  changeProfile: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  searchMessagesOpen: false,
  selectedMessageId: null,
  userContacts: [],
  onlineUsers: [],
  filteredContacts: [],
  contactSearch: "",
  groups: [], 
  currentGroup: null, 
  groupMessages: [], 
  filteredGroups: [],
  isInfoOpen: false,
  isSmallAndChatOpen: false,
  isSmallscreen: false 
};

// Create the reducer
function stateReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'CONTACT_SEARCH_PAGE':
      return { ...state, contactSearchPage: action.payload };
    case 'CHANGE_PROFILE':
      return { ...state, changeProfile: action.payload };
    case 'CHANGE_CURRENT_CHAT_USER':
      return { ...state, currentChatUser: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'SET_SOCKET':
      return { ...state, socket: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SEARCH_MESSAGES_OPEN':
      return { ...state, searchMessagesOpen: action.payload };
    case 'SET_USER_CONTACTS':
      return { ...state, userContacts: action.payload };
    case 'PUSH_IN_USER_CONTACTS': // *********** this is not in use ****************
      return { ...state, userContacts: [...state.userContacts, action.payload] };
    case 'SET_ONLINE_USERS': // New case
      return { ...state, onlineUsers: action.payload };
    case 'USER_ONLINE':
      return { ...state, onlineUsers: [...state.onlineUsers, action.payload.userId] };
    case 'USER_OFFLINE':
      return { ...state, onlineUsers: state.onlineUsers.filter(id => id !== action.payload.userId) };
    case 'UPDATE_MESSAGE_STATUS':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.messageId
            ? { ...msg, messageStatus: action.payload.status }
            : msg
        ),
      };
    case 'SET_SELECTED_MESSAGE':
      return { ...state, selectedMessageId: action.payload };
    case 'FILTERED_CONTACTS':
      return { ...state, filteredContacts: action.payload };
    case 'SET_CONTACTS_SEARCH':
      const filteredContacts = state.userContacts.filter((contact) =>
        contact.username.toLowerCase().includes(action.payload.toLowerCase())
      );
      const filteredGroups = state.groups.filter((group) =>
        group.name.toLowerCase().includes(action.payload.toLowerCase())
      );
      return {
        ...state,
        contactSearch: action.payload,
        filteredContacts,
        filteredGroups,
      };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload };
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroup: action.payload };
      case 'ADD_GROUP_MESSAGE':
        return {
            ...state,
            groupMessages: [...state.groupMessages, action.payload]
        }
    case 'SET_GROUP_MESSAGES':
      return {
        ...state,
        groupMessages:  action.payload,
        }
        
    case 'INCREMENT_UNREAD':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, unreadCount: (group.unreadCount || 0) + 1 }
            : group
        ),
      };
    case 'RESET_UNREAD':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, unreadCount: 0 }
            : group
        ),
      };
    case 'UPDATE_GROUP_LAST_MESSAGE_TIME':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, lastMessageTime: action.payload.lastMessageTime }
            : group
        ),
      };

    case 'IS_INFO_OPEN':
      return { ...state, isInfoOpen: action.payload };

    case 'SET_IS_SMALL_AND_CHAT_OPEN':
      return { ...state, isSmallAndChatOpen: action.payload }
    case 'SET_IS_SMALL_SCREEN':
      return { ...state, isSmallscreen: action.payload }
    default:
      return state;
  }
}

// Create the context
const StateContext = createContext(initialState);

// Create a provider component
export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stateReducer, initialState);

  // Memoize context functions
  const setUser = useCallback((user) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setContactSearchPage = useCallback((contactSearchPage) => {
    dispatch({ type: 'CONTACT_SEARCH_PAGE', payload: contactSearchPage });
  }, []);

  const setChangeProfile = useCallback((changeProfile) => {
    dispatch({ type: 'CHANGE_PROFILE', payload: changeProfile });
  }, []);

  const setCurrentChatUser = useCallback((currentChatUser) => {
    dispatch({ type: 'CHANGE_CURRENT_CHAT_USER', payload: currentChatUser });
  }, []);

  const setMessages = useCallback((messages) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  }, []);

  const setSocket = useCallback((socket) => {
    dispatch({ type: 'SET_SOCKET', payload: socket });
  }, []);

  const setAddMessage = useCallback((addMessage) => {
    dispatch({ type: 'ADD_MESSAGE', payload: addMessage });
  }, []);

  const setSearchMessagesOpen = useCallback((searchMessagesOpen) => {
    dispatch({ type: 'SEARCH_MESSAGES_OPEN', payload: searchMessagesOpen });
  }, []);

  const setSelectedMessage = useCallback((messageId) => {
    dispatch({ type: 'SET_SELECTED_MESSAGE', payload: messageId });
  }, []);

  const setUserContacts = useCallback((userContacts) => {
    dispatch({ type: 'SET_USER_CONTACTS', payload: userContacts });
  }, []);

  const setPushUserContacts = useCallback((userContacts) => { // ********** this is not in use for now ***********
    dispatch({ type: 'PUSH_IN_USER_CONTACTS', payload: userContacts });
  }, []);

  const setOnlineUsers = useCallback((onlineUsers) => {
    dispatch({ type: 'SET_ONLINE_USERS', payload: onlineUsers });
  }, []);

  const setUserOnline = useCallback((userId) => {
    dispatch({ type: 'USER_ONLINE', payload: { userId } });
  }, []);

  const setUserOffline = useCallback((userId) => {
    dispatch({ type: 'USER_OFFLINE', payload: { userId } });
  }, []);

  const setMessageStatusRead = useCallback((messageId, status = 'read') => {
    dispatch({ type: 'UPDATE_MESSAGE_STATUS', payload: { messageId, status } });
  }, []);

  const setFilteredContacts = useCallback((filteredContacts) => {
    dispatch({ type: 'FILTERED_CONTACTS', payload: filteredContacts });
  }, []);

  const setContactSearch = useCallback((contactSearch) => {
    dispatch({ type: 'SET_CONTACTS_SEARCH', payload: contactSearch });
  }, []);

  // const setContactSearch = useCallback((contactSearch) => {
  //   dispatch({ type: 'SET_CONTACTS_SEARCH', payload: contactSearch });
  // }, []);

  const setGroups = useCallback((groups) => {
    dispatch({ type: 'SET_GROUPS', payload: groups });
  }, []);

  const setCurrentGroup = useCallback((group) => {
    dispatch({ type: 'SET_CURRENT_GROUP', payload: group });
  }, []);

  const addGroupMessage = useCallback((data) => {
    dispatch({ type: 'ADD_GROUP_MESSAGE', payload: data });
    }, []);

  const setGroupMessages = useCallback(( messages ) => {
    dispatch({ type: 'SET_GROUP_MESSAGES', payload: messages });
  }, []);

  const incrementUnread = useCallback((groupId) => {
    dispatch({ type: 'INCREMENT_UNREAD', payload: { groupId } });
  }, []);

  const resetUnread = useCallback((groupId) => {
    dispatch({ type: 'RESET_UNREAD', payload: { groupId } });
  }, []);

  const updateGroupLastMessageTime = (groupId, lastMessageTime) => {
    dispatch({
      type: 'UPDATE_GROUP_LAST_MESSAGE_TIME',
      payload: { groupId, lastMessageTime },
    });
  };

  const setIsInfoOpen = useCallback((data) => {
    dispatch({ type: 'IS_INFO_OPEN', payload: data });
    }, []);

  const setIsSmallAndChatOpen = useCallback((data) => {
    dispatch({ type: 'SET_IS_SMALL_AND_CHAT_OPEN', payload: data });
    }, []);
    
  const setIsSmallscreen = useCallback((data) => {
      dispatch({ type: 'SET_IS_SMALL_SCREEN', payload: data });
      }, []);
  
  return (
    <StateContext.Provider value={{
      state,
      setUser,
      setContactSearchPage,
      setChangeProfile,
      setCurrentChatUser,
      setMessages,
      setSocket,
      setAddMessage,
      setSearchMessagesOpen,
      setSelectedMessage,
      setUserContacts,
      setPushUserContacts, // ************** not in use for now ***********
      setOnlineUsers,
      setUserOnline,
      setUserOffline,
      setMessageStatusRead,
      setFilteredContacts,
      setContactSearch,
      setGroups,
      setCurrentGroup,
      addGroupMessage,
      setGroupMessages,
      incrementUnread,
      resetUnread,
      updateGroupLastMessageTime,
      setIsInfoOpen,
      setIsSmallAndChatOpen,
      setIsSmallscreen
    }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  return useContext(StateContext);
};