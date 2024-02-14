import React, {useEffect, useState} from "react";
import { cookies } from "../App";
import ChannelPopUpList  from "./ChannelPopUpList";
import setting from "../images/setting.png";
import ChannelSetting from "./ChannelSetting";


const ChannelPopUp = ({channel}) =>{

	const [popChannel, setPopChannel] =  useState({Users: []});
    const [checkMute, setCheckMute] = useState<boolean>();
	const [isPopOpen, setPopOpen] = useState<boolean>(false);
    const [IsOwner, setIsOwner] = useState<boolean>();
    const [IsAdmin, setIsAdmin] = useState<boolean>();
	const channelName = channel.Name;

	useEffect ( () => {
		const fetchData = async () =>{
			const responseClients =await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${channel.Name}`, {
				headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
			});
			const resPopChannel = await responseClients.json();
			setPopChannel(resPopChannel.channel);
			const myid:number = resPopChannel.myid;
			setIsOwner(resPopChannel.channel.ChannelOwnerID === myid ? true : false);
			setIsAdmin(resPopChannel.channel.AdminIDs.some(element => element === myid));
		}
		fetchData();
	}, [checkMute])

	const clickSetting = () =>{
		setPopOpen(true);
	}

return(
    <div className="channelPopUp">
        <div className="channelPopUpPage">
			<div className="channelPageUp">
            	<span className="groupName">{channel.Name}</span>
				{ IsOwner ?
					( <img onClick={clickSetting} className="settingGroup" src={setting} alt=""/> )
					: (null)
				}
			</div>
			<div>
				{popChannel.Users.map((client, index) => (
					<ChannelPopUpList key={index} client={client} channel={popChannel} checkMute={checkMute} setCheckMute={setCheckMute} IsAdmin={IsAdmin}/>
				))}
			</div>
		</div>
			{isPopOpen && <ChannelSetting setPopOpen={setPopOpen} channelName={channelName}></ChannelSetting>}
		</div>
)
}

export default ChannelPopUp;
