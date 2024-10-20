import React, { useState } from 'react';
import { FaPen, FaArrowLeft, FaCheck } from 'react-icons/fa';
import Avatar from '../common/profile/Avatar'; 
import { useStateContext } from '../../../providers/StateContext';
import { FiLogOut } from 'react-icons/fi';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { FiSettings } from 'react-icons/fi';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Loading from '../common/Loading';

function ChangeProfile() {
  const { state, setChangeProfile, setUser } = useStateContext();
  const { user, changeProfile } = state;
  const router = useRouter();

  const [name, setName] = useState(user?.username);
  const [about, setAbout] = useState(user?.about);
  const [image, setImage] = useState(
    user?.profilePicture?
    `${process.env.NEXT_PUBLIC_HOST}/${user?.profilePicture}`:""
  ); 
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isDeleteImage, setIsDeleteImage] = useState(false);
  const [hasChanged, setHasChanged] = useState({ name: false, about: false });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle Logout
  const LogOutHandler = () => {
    Cookies.remove('chatAppToken');
    setUser(null);
    router.push("/login");
    toast.success("Logout successfully!");
  }

  // Handle Settings
  const settingHandler = () => {
    console.log("Settings handler called!!");
  }

  // Handle Save
  const handleSave = async () => {
    const token = Cookies.get('chatAppToken');
    if (!token) {
      toast.error("Not authenticated!");
      return;
    }

    const formData = new FormData();
    
    if (hasChanged.name) {
      console.log("name changed");
      formData.append('username', name);
    }
    if (hasChanged.about) {
      console.log("about changed");
      formData.append('about', about);
    }
    if (isEditingImage && imageFile) {
      console.log("image changed");
      formData.append('profilePicture', imageFile); 
    }

    try {
      let response;

      if(isDeleteImage  && isEditingImage){
        response = await axios.delete(
          `${process.env.NEXT_PUBLIC_HOST}/api/v1/user/update-profile/?url=${user?.profilePicture}`, 
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setImage("");
      }else{
        response = await axios.patch(
          `${process.env.NEXT_PUBLIC_HOST}/api/v1/user/update-profile/`, 
          formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      

      if(response.data){
        const userData = response.data.data;
        setUser(userData);
      }
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("An error occurred while updating the profile.");
    }

    setIsEditingName(false);
    setIsEditingAbout(false);
    setIsEditingImage(false);
    setHasChanged({ name: false, about: false });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    setHasChanged((prev) => ({ ...prev, name: true }));
  };

  const handleAboutChange = (e) => {
    setAbout(e.target.value);
    setHasChanged((prev) => ({ ...prev, about: true }));
  };

  return (
    <div className={`
    absolute 
    top-0 left-0 
    h-full 
    transform 
    transition-transform 
    ${changeProfile ? 'translate-x-0' : '-translate-x-full'} 
    z-30 w-full 
    bg-conversation-panel-background`}>
      <div className="flex flex-col w-full h-full p-4 gap-6 overflow-auto">
        <div className="flex items-center gap-12 text-white p-5">
          <button aria-label="close sidebar" 
          className="text-panel-header-icon" 
          onClick={() => setChangeProfile(false)}>
            <FaArrowLeft className="text-xl" />
          </button>
          <span>Profile</span>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center justify-center mb-4">
          <Avatar 
            type="xl" 
            image={image} 
            setImage={setImage} 
            setIsEditingImage={setIsEditingImage} 
            setImageFile={setImageFile}
            setIsDeleteImage={setIsDeleteImage}
            className="rounded-full" 
          />

          {/* Name Input */}
          <div className="flex flex-col items-start justify-between w-full mt-4">
            <label className="text-sm text-panel-header-icon">Your name</label>
            <div className="flex items-center w-full">
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                disabled={!isEditingName}
                className="border-conversation-border w-full input rounded-md"
              />
              {isEditingName ? (
                <FaCheck className="
                ml-2 text-panel-header-icon 
                cursor-pointer" 
                onClick={() => setIsEditingName(false)} />
              ) : (
                <FaPen className="
                ml-2 
                text-panel-header-icon 
                cursor-pointer" onClick={() => setIsEditingName(true)} />
              )}
            </div>
          </div>

          {/* About Input */}
          <div className="flex flex-col items-start justify-between w-full mt-4">
            <label className="text-sm text-panel-header-icon">About</label>
            <div className="flex items-center w-full">
              <textarea 
              name="about"
              value={about}
              onChange={handleAboutChange}
              disabled={!isEditingAbout}
              className="border-conversation-border w-full input rounded-md"
              maxLength={50}
              ></textarea>
              {isEditingAbout ? (
                <FaCheck className="
                ml-2 
                text-panel-header-icon 
                cursor-pointer" onClick={() => setIsEditingAbout(false)} />
              ) : (
                <FaPen className="
                ml-2 
                text-panel-header-icon 
                cursor-pointer" onClick={() => setIsEditingAbout(true)} />
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-auto">
          <button
            className={`
              btn bg-[#007d88] 
              text-white 
              ${hasChanged.name || hasChanged.about || isEditingImage 
              ? '' : 'disabled:opacity-50'}`}
            onClick={handleSave}
            disabled={!hasChanged.name && !hasChanged.about && !isEditingImage}
          >
            Save
          </button>
        </div>

        <div className='flex flex-col items-start justify-center text-white p-4 gap-6'>
          <div className='flex gap-4 cursor-pointer' onClick={() => settingHandler()}>
            <FiSettings className="text-panel-header-icon size-5" />
            Setting
          </div>
          <div className='flex gap-4 cursor-pointer' onClick={() => LogOutHandler()}>
            <FiLogOut className="text-red-600 size-5" />
            Logout
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChangeProfile;