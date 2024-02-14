import React, { useEffect } from "react";
import Channel from "./Channel";
import { cookies } from "../App";

const GroupChatSearch = ({ channelList, setChannelList, setCurrentChannel, currentChannel}) => {
  useEffect (() => {
      const fetchData = async () =>{
          const responseChannels = await fetch(`https://${process.env.REACT_APP_IP}:80/user/channels`, {
              headers: {
                  'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                  'Content-Type': 'application/json'
              }
          });
          const CHs = await responseChannels.json();
          setChannelList(CHs);
      }
      fetchData();
  }, [])
  useEffect(()=>{
  },[channelList])
  return (
    <div className="chatSearch">
      {/* <div className="searchForm">
        <input className="searchInput" type="text" placeholder="find a user" />
      </div> */}
      {channelList.map((channel, index) => (
        <Channel key={index} channel={channel} channelList={channelList} setCurrentChannel={setCurrentChannel} currentChannel={currentChannel} setChannelList={setChannelList}/>
      ))}
    </div>
  );
};

export default GroupChatSearch;
