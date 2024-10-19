"use client";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useStateContext } from '../providers/StateContext';
import Main from './components/Main';
import Loading from './components/common/Loading';

export default function Home() {
  const router = useRouter();
  const { state, setUser } = useStateContext();
  const { user } = state;

  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    if (!user) { 
   
      const token = Cookies.get("chatAppToken");
      if (token) {
        try {
          const userData = jwtDecode(token);
          setUser(userData);
          setLoading(false);
        } catch (error) {
          Cookies.remove('chatAppToken'); 
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
    setLoading(false); 
  }, []);  


  return loading ? (
        <div className='h-screen'><Loading/></div>
      ) : (
        <div className="fixed top-0 left-0 h-screen w-screen">
          <Main/>
        </div>
      );
}



