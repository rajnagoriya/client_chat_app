"use client";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useStateContext } from '../providers/StateContext';
import Main from './components/Main';
import Loading from './components/common/Loading';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const token = Cookies.get('chatAppToken');
  
  const { state, setUser, setIsSmallscreen } = useStateContext();
  const { user } = state;

  const [loading, setLoading] = useState(true);


  // // Function to handle screen size changes
  const handleResize = useCallback(() => {
    setIsSmallscreen(window.innerWidth <= 1024);
  }, [setIsSmallscreen]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/v1/user/myProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setUser(response.data.data);
    } catch (error) {
      router.push("/login");
      toast.error(error?.response?.data?.message || "Something went wrong while fetching profile.");
    }finally{
      setLoading(false);
    }
  }, [token, setUser]);

  // Effect to listen for window resize
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Effect to fetch profile data if token is available
  useEffect(() => {
    if (token){
       fetchUserProfile();
    }else {
      router.push("/login");
      setLoading(false);
    }
  }, [token, fetchUserProfile]);


  return loading ? (
    <div className='h-screen'><Loading /></div>
  ) : (
    <div className="fixed top-0 left-0 h-screen w-screen">
      <Main />
    </div>
  );
}



