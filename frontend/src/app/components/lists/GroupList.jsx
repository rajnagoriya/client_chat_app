import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListItem from '../common/ListItem';
import Cookies from 'js-cookie';
import { useStateContext } from '@/providers/StateContext';

function GroupList() {
  const token = Cookies.get("chatAppToken");
  const { state, setGroups } = useStateContext();
  const { user, groups, filteredGroups } = state;
  const [sortedGroups, setSortedGroups] = useState([]);

  const displayGroups = filteredGroups.length > 0 ? filteredGroups : groups;

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/unread`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroups(response.data.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    if (user?.id) {
      fetchGroups();
    }
  }, [user, setGroups, token]);

  useEffect(() => {
    const sorted = [...displayGroups].sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || 0).getTime();
      const timeB = new Date(b.lastMessageTime || 0).getTime();
      return timeB - timeA;
    });
    setSortedGroups(sorted);
  }, [displayGroups]);

  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar text-center">
      {sortedGroups && sortedGroups.length > 0
        ? sortedGroups.map((group) => <ListItem key={group.id} item={group} type="group" />)
        : <p>No groups found.</p>
      }
    </div>
  );
}

export default GroupList;