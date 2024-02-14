import React, { useEffect, useState } from "react";
import PrivChannel from "./PrivChannel";
import { cookies } from "../App";

const ChatSearch = ({setCurrentChannel}) =>{
    const [channelList, setChannelList] = useState([]);
    useEffect (() => {
        const fetchData = async () =>{
            const responseChannels = await fetch(`https://${process.env.REACT_APP_IP}:80/user/privChannels`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            });
            const CHs = await responseChannels.json();
            setChannelList(CHs);
        }
        fetchData();
    }, [])

    useEffect(() => {
      }, [channelList]);
    return(
        <div className="chatSearch">
            {/* <div className="searchForm">
                <input className="searchInput" type="text" placeholder="find a user" />
            </div> */}
                {channelList.map((channel, index) => (
                    <PrivChannel key={index} channel={channel} setCurrentChannel={setCurrentChannel} />
                ))}
        </div>
    )

}

export default ChatSearch;
