"use client"
import { useStateContext } from '@/providers/StateContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '../profile/Avatar';

function AddUsers({ onClose }) {
  const token = Cookies.get("chatAppToken");

  const { state, setIsInfoOpen } = useStateContext();
  const { user, userContacts,currentGroup } = state;

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers([]);
    } else {
      const filtered = userContacts.filter((contact) =>
        contact.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, userContacts]);

  const handleUserSelect = (user) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedUsers.length === 0) {
      toast.error('At least one user is required.');
      return;
    }
  
    const userIds = selectedUsers.map(user => user.id);
    const data = {
      adminId: user.id,
      userIds: userIds, 
    };
  
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}/add`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.message || "Users added successfully!");
      setIsInfoOpen(false)
      onClose();
    } catch (error) {
      console.log("Error in add user is: ", error);
      toast.error(error.response?.data?.message || 'Failed to add users.');
    }
  };
  
  

  return (
    <>
    <input type="checkbox" id="create-group-modal" className="modal-toggle" checked readOnly />
    <div className="modal modal-open">
      <div className="modal-box relative">
        <label
          htmlFor="create-group-modal"
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </label>
        <h3 className="text-lg font-bold">Add New Users</h3>
        <form onSubmit={handleSubmit} className="mt-4">
        
          <div className="form-control mt-4">
            <label className="label">Search Users</label>
            <input
              type="text"
              placeholder="Search users to add"
              className="input input-bordered"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredUsers.length > 0 && (
              <ul className="border border-gray-300 rounded mt-2 max-h-40 overflow-y-auto">
                {filteredUsers.map((contact) => (
                  <li
                    key={contact.id}
                    className="flex items-center p-2 hover:bg-gray-500 cursor-pointer"
                    onClick={() => handleUserSelect(contact)}
                  >
                    <Avatar type="sm" image={contact.profilePicture ? `${process.env.NEXT_PUBLIC_HOST}/${contact.profilePicture}` : ''} />
                    <span className="ml-2">{contact.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-control mt-4">
            <label className="label">Selected Users</label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex items-center bg-gray-700 px-2 py-1 rounded">
                  <Avatar type="sm" image={user.profilePicture ? `${process.env.NEXT_PUBLIC_HOST}/${user.profilePicture}` : ''} />
                  <span className="ml-2">{user.username}</span>
                  <button type="button" className="ml-2 text-red-500" onClick={() => handleUserRemove(user.id)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-action">
            <button type="submit" className="btn bg-[#007d88] ">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default AddUsers;
