import React, { useState } from "react";
import ChannelCreate from "./ChannelCreate";
import groupAdd from "../images/groupAdd.png"

const GroupSidebarNav = ({channelList, setChannelList}) =>{
	const [isPopOpen, setPopOpen] =useState(false);

    const handleClick = () =>{
		setPopOpen(true);
	}
    return(
        <div className="sidebarNav">
            <span className="sidebarLogo">GroupChat</span>
            <div className="messageBoxIcon">
					<div onClick={handleClick}>
						<img className="messageBoxIconImage"  src={groupAdd} />
					</div>
				</div>
                {isPopOpen && <ChannelCreate setPopOpen ={setPopOpen} channelList={channelList} setChannelList={setChannelList}/>}
        </div>
    )
}

export default GroupSidebarNav;
