import React, {useEffect, useState} from "react";
import mute from "../images/mute.png"
import unmute from "../images/unmute.png"
import admin from  "../images/admin.png"
import ban from "../images/ban.png"
import kick from "../images/kick.png"
import { cookies } from "../App";

const ChannelPopUpList = ({client, channel, checkMute, setCheckMute, IsAdmin}) =>{

    useEffect(() => {
        if (channel.MutedIDs.some(element => element === client.id))
            setCheckMute(true);
        else
            setCheckMute(false);
    },[])

    const changeMute = ()=>{
        if (channel.MutedIDs.some(element => element === client.id))
            setCheckMute(true);
        else
            setCheckMute(false);
    }

    const handleClick =(e) =>{

            const fetchData = async () =>{
                const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${channel.Name}/${(e.target).id}/${client.nick}`, {
                    headers: { 'authorization': 'Bearer ' + cookies.get("jwt_authorization"), }
                });
                const res = await response.json();
                console.log(res);
                if (!res.error)
                {
                    if ((e.target).id === "mute")
                    {
                        changeMute();
                    }
                }
                else{
                    console.log(res.error);
                    alert(res.error);
                }
            }
            fetchData();
    }
	return(
		<div>
			 <div className="groupOnePerson">
                <div>
                    <p>{client.nick}</p>
                </div>
                { IsAdmin  ? (
                    <div className="groupOnePersonIcons">
                        <img onClick={handleClick} className="channelPopUpIcon" src={kick} id="kick" />
                        <img onClick={handleClick} className="channelPopUpIcon" src={ban} id="ban"/>
                        <img onClick={handleClick} className="channelPopUpIcon" src={admin} id="setAdmin"/>
                        {checkMute === true ? (
                            <img onClick={handleClick} className="channelPopUpIcon" src={mute} id="mute"/>
                            ):(
                                <img onClick={handleClick} className="channelPopUpIcon" src={unmute} id="mute"/>
                        )}
                    </div>
                ): (null)
                }
            </div>
		</div>
	)

}

export default ChannelPopUpList;
