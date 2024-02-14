import React, { useState } from "react";
import GroupSidebarNav from "./GroupSidebarNav";
import GroupChatSearch from "./GroupChatSearch";

const GroupSidebar = ({setCurrentChannel, currentChannel}) =>{
    const [ channelList, setChannelList ] = useState([]);
    return(
        <div className="sidebar">
            <GroupSidebarNav channelList={channelList} setChannelList={setChannelList}/>
            <GroupChatSearch channelList={channelList} setChannelList={setChannelList} setCurrentChannel={setCurrentChannel} currentChannel={currentChannel} />
        </div>
    )

}

export default GroupSidebar;
