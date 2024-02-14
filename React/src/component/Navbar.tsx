import React,{useState} from "react";
import {Link} from "react-router-dom";
import notification from "../images/notification.png";
import ok from "../images/ok.png";
import ko from "../images/close.png";
import { cookies } from "../App";
import { socket } from "../pages/Home";
import { socketGame } from "./Game";


const Navbar = ({user, setUser, maxSocket, isFormSigned}) => {
    const [isPopOpen, setPopOpen] = useState<boolean>(false);
    const [isNotification, setNotification] = useState([]);
    const HandleDisconnection = () => {
        cookies.remove("jwt_authorization");
        cookies.remove("TFAStatus");
        socket.disconnect();
        socketGame.disconnect();
        setUser({res: "undefined"})
    }
    const handleClick = ()=>{
        if (isPopOpen === false)
        {
            setPopOpen(true);
            const fetchData = async () =>{
                const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/friendRequests`, {
                    headers: {
                        'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                    }
                })
                const fReq = await response.json();
                setNotification(fReq);
            }
            fetchData();
        }
        else{
            setPopOpen(false);
        }
    }
    const acceptFriend = (e) =>{
        const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/acceptFriend/${e}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            if (response.ok) {
                setNotification(prevNotifications => prevNotifications.filter(not => not.nick !== e));
            } else {
                console.error('Failed to accept friend request');
            }
        }
        fetchData();
    }
    const rejectFriend = (e) => {
        const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/rejectFriend/${e}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            if (response.ok) {
                // Update local state to remove the rejected friend request
                setNotification(prevNotifications => prevNotifications.filter(not => not.nick !== e));
            } else {
                // Handle error case if needed
                console.error('Failed to reject friend request');
            }
        }
        fetchData();
    }

    return (
        <div className="navbar">
            <span className="logo"><Link to="/" className="link">TRANSCENDENCE</Link></span>
            {user.res !== "undefined" && maxSocket !== true && isFormSigned !== false ? (
                <ul className="list">
                 <p className="pItem">{user.login}</p>
                     {/* <img src="" alt="img" className="avatar"></img> */}
                    <span className="iconItem"  onClick={handleClick}  ><img className="avatar" src={notification} alt="a"/></span>
                    {isPopOpen === true ? (
                        <div className="navbarPopUp">
                                <div className="popUpList">
                                {
                                    isNotification.map((not, index) =>(
                                        <div className="popUpListLi">
                                            <li  key={index}> {not.nick}</li>
                                            <div> <img src={ok} alt="a" onClick={()=>acceptFriend(not.nick)} defaultValue = {not.nick}/><img src={ko} alt="b"onClick={() =>rejectFriend(not.nick)}/></div>
                                        </div>
                                    ))
                                }
                                </div>
                        </div>
                    ):(null)}
                    <div><li className="listItem"><Link className="link" to="/profile">Profile</Link></li></div>
                    <div><li className="listItem"><Link className="link" to="/leaderboard">LeaderBoard</Link></li></div>
                    <div> <li className="listItem"><Link className="link" to="/chat">Chat</Link></li></div>
                    <div> <li className="listItem" onClick={HandleDisconnection}><Link className="link" to="/">Logout</Link></li></div>
             </ul>
            ) : (null)}

        </div>
    )
}
export default Navbar;
