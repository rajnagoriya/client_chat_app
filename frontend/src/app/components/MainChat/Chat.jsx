"use client"; 
import dynamic from 'next/dynamic';
import React from 'react'
import ChatHeader from '../common/headers/ChatHeader'
import ChatContainer from '../chatcontainers/ChatContainer'
import { useStateContext } from '@/providers/StateContext';
import GroupChatContainer from '../chatcontainers/GroupChatContainer';
import InfoBar from '../common/InfoBar';
const MessageBar = dynamic(() => import('../common/messageBar/MessageBar'), { ssr: false });

function Chat() {
  const { state } = useStateContext();
  const { currentGroup, isInfoOpen } = state;

  return (
    <>
    <div className="
    border-conversation-border
    border-l w-full
    bg-conversation-panel-background 
    flex flex-col h-full z-10 ">
    <ChatHeader/>
    {currentGroup ? <GroupChatContainer/> : <ChatContainer/>}
    <MessageBar/>

    </div>
    {isInfoOpen && <InfoBar/>}
    </>
  )
}

export default Chat