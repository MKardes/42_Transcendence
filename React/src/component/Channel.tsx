import React, {useState} from "react";
import image from "../images/group.jpeg"
import xButton from "../images/x.png";

import PopUp from "./ChannelPopUp"
import { cookies } from "../App";


const Channel = ({channel, channelList, setCurrentChannel, currentChannel, setChannelList}) =>{
	const HandleClick = async () => {
        setCurrentChannel(channel.Name);
    }
    const [isPopOpen, setPopOpen] = useState(false);
    const [popUpPosition, setPopUpPosition] = useState({left: 0, top:0});

    const mouseOver = (e) =>{
        setPopOpen(true);

        const rect = e.target.getBoundingClientRect();
        setPopUpPosition({
            left: rect.left + rect.width + 10,
            top: rect.top,
        });
    };
    const mouseOut = () =>{
        setPopOpen(false);
    };
    const channelLeave = async () =>{
        const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${channel.Name}/leave`, {
            headers: {
                'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
			}
		})
        if (response.ok)
        {
            if (currentChannel === channel.Name)
                setCurrentChannel("");
            setChannelList(channelList.filter(element => element.Name !== channel.Name))
        } else {
            const res = await response.json();
            alert(res.error);
        }
    }
    return(
        <div className="userChat" onClick={HandleClick} onMouseOver={mouseOver} onMouseLeave={mouseOut}>
		        <div className="userChatChannel">
                    <div className="userChatInfo">
                        <img className="searchChatImage" src={image} alt="channel"/>
                        <span className="chatInfoSpan">{channel.Name}</span>
                    </div>
                    <div className="leaveChatXButton" onClick={channelLeave}><img src={xButton} alt=""/></div>
                </div>
            <div  style={{left: popUpPosition.left, top:popUpPosition.top}}>
                {isPopOpen && <PopUp channel={channel} />}
            </div>
		</div>
    )
}
export default Channel;
