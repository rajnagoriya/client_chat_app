import { useStateContext } from '@/providers/StateContext';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BiSearchAlt2 } from 'react-icons/bi';
import { FaArrowLeft } from 'react-icons/fa';
import ListItem from '../common/ListItem';

function SearchNewUsers() {
 
  const { state, setContactSearchPage, } = useStateContext();
  const { contactSearchPage, } = state;

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  //    api call for search contacts 
  const handleSearch = async () => {
    const token = Cookies.get('chatAppToken');
    if (!token) {
      toast.error("Not authenticated!");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_HOST }/api/v1/user/search?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
        }
      }
      );
      
      setAllUsers(response?.data?.data)
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }

  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div
      className={`
        absolute top-0 left-0 
        h-full transform 
        transition-transform 
        ${contactSearchPage ? 'translate-x-0' : '-translate-x-full'}
        z-30 w-full bg-conversation-panel-background`}
    >
      <div className="flex flex-col w-full h-full  gap-6 bg-panel-header-background">

        {/* Back Arrow Button */}
        <div className="flex  items-center  gap-12 p-1 text-white bg-panel-header-background">
          <button
            aria-label="close sidebar"
            className="text-panel-header-icon pt-2"
            onClick={() => setContactSearchPage(false)}
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <span className="pt-2">New Chat</span>
        </div>

        <div className="
        bg-search-input-container-background 
        h-full 
        flex-auto 
        overflow-auto 
        custom-scrollbar">
          <div className=" flex py-3 px-4 items-center gap-3 h-14">
            <div className="
            bg-panel-header-background 
            flex items-center 
            justify-between 
            gap-5 
            px-3 py-1 
            rounded-lg 
            flex-grow">

              <div className="w-full">
                <input
                  type="text"
                  placeholder="Search Users"
                  className="bg-transparent text-sm focus:outline-none text-white w-full"
                  onChange={(e) => handleSearchChange(e)}
                  value={search}
                />
              </div>
              <div>
                <BiSearchAlt2 className="
                text-panel-header-icon 
                cursor-pointer 
                text-l" onClick={handleSearch} />
              </div>
            </div>
          </div>
          <div>
            {
              loading ? <div>Loading....</div> : <>{
                allUsers ?
                  <>
                    {allUsers?.map((user) => {
                      return (
                        <ListItem key={user.id} item={user} type="chat" />
                      );
                    })}
                  </> : <h1 className='text-center'>No user found</h1>
              }
              </>
            }
          </div>

        </div>
      </div>
    </div>
  );
}

export default SearchNewUsers