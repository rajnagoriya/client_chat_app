// CreateGroupModal.jsx
"use client"
import { useStateContext } from '@/providers/StateContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import toast from 'react-hot-toast';

function EditGroupInfo({ onClose }) {
  const token = Cookies.get("chatAppToken");

  const { state, } = useStateContext();
  const { currentGroup } = state;

  const [groupName, setGroupName] = useState('');
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [groupAbout,setGroupAbout] = useState('');
  const [loading, setIsLoading] = useState(false);


  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGroupAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    if(groupName){
        formData.append('name', groupName);
    }
  
    if(groupAbout){
        formData.append('about', groupAbout);
    }

    if (groupAvatar) {
      formData.append('avatar', groupAvatar);
    }

    try {
      setIsLoading(true);
      const response = await axios.put(`${process.env.NEXT_PUBLIC_HOST}/api/v1/group/${currentGroup.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // Adjust if you're using tokens
        },
      });
      const updatedGroup = response.data.data ;
      currentGroup.name = updatedGroup.name;
      currentGroup.about = updatedGroup.about;
      currentGroup.avatar = updatedGroup.avatar;
      toast.success(response.data.data.message||"Info Edited successfully")
      onClose();   
    } catch (error) {
      toast.error('Failed to edit group Info.');
    }finally{
      setIsLoading(false);
    }
  };

  return (
    <>
    <input 
    type="checkbox" 
    id="create-group-modal" 
    className="modal-toggle" 
    checked readOnly 
    />
    <div className="modal modal-open">
      <div className="modal-box relative">
        <label
          htmlFor="create-group-modal"
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </label>
        <h3 className="text-lg font-bold">Edit Group Info</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="form-control">
            <label className="label">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              className="input input-bordered"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <div className="form-control mt-4">
            <label className="label">Group Avatar</label>
            <input 
            type="file" 
            accept="image/*" 
            className="file-input file-input-bordered" 
            onChange={handleAvatarChange} 
            />
          </div>
          <div className="form-control mt-4">
            <label className="label">About</label>
            <textarea 
            name="about" 
            onChange={(e)=> setGroupAbout(e.target.value)} 
            maxLength={50}
            className="input input-bordered"
            ></textarea>
          </div>
          <div className="modal-action">
            <button type="submit" className={`${
                loading ? "btn bg-[#6b9292]":"btn bg-[#007d88]"
              }`}>
               {loading? "Editing..." : "Edit"}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

export default EditGroupInfo;