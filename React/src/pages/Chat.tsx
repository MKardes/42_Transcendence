import React, { useEffect, useState } from "react";
import MainBox from "../component/MainBox";
import Friends from "../component/Friends";
import Sidebar from "../component/Sidebar";
import GroupSidebar from "../component/GroupSidebar";
import { cookies } from "../App";

const Chat = ({setCurrentChannel, currentChannel}) =>{
    const [user, setUser] = useState({res: "undefined"});

    useEffect(() =>{
        const fetchData = async () => {
            const responseUser = await fetch(`https://${process.env.REACT_APP_IP}:80/user/checkJWT`,{
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                  }
            });
            const res = await responseUser.json();
            setUser({...res, res:"user"});
        }
        fetchData();
    },[setCurrentChannel]);
    return(
        <div className="chat">
            <div className="chatContainer">
                    <Sidebar setCurrentChannel={setCurrentChannel} />
                    <MainBox currentChannel={currentChannel}  user={user}/>
                    <GroupSidebar  setCurrentChannel={setCurrentChannel} currentChannel={currentChannel} />
            </div>
            <div className="friends">
                <Friends />
            </div>
        </div>
    )
}

export default Chat;
