import { useStateContext } from "@/providers/StateContext";
import { IoArrowBack } from "react-icons/io5";
import { MdMessage } from "react-icons/md";

function Empty() {
  const { 
    state, 
    setIsSmallAndChatOpen 
  } = useStateContext();

  const { 
    isSmallscreen, 
  } = state;

  const handleBackClick = () => {
    setIsSmallAndChatOpen(false);
  };

  return (
    <>
    <span>
      <div className="flex items-center gap-6 cursor-pointer">
    {isSmallscreen && (
      <IoArrowBack className="text-2xl cursor-pointer" onClick={handleBackClick} />
    )}
  </div>
  </span>
    <div className="
    border-conversation-border 
    border-l w-full 
    flex flex-col 
    h-[100vh] 
    border-b-4 
    border-[#007d88]
    items-center 
    justify-center
    size-24
    text-white
    ">
      <MdMessage className="size-24"/>
      <h1>
        start chat 
        
      </h1>
    </div>
    </>
  );
}

export default Empty;
