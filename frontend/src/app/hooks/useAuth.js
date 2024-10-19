

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';


export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('chatAppToken');
    if (!token) {
      router.push('/login');  // Redirect to login if no token
    } else {
      return;
    }

  }, []);
}