import React, { useState } from "react";
import messageIcon from "../images/message.png";
import ignoreIcon from "../images/ignore.png"
import gameInvite from "../images/gameInvite.png"
import invite from "../images/invite.png"
import { Link } from "react-router-dom";
import { cookies } from "../App";

const Friend = ({friend, status, setStatus}) =>{
    const [isPopUp, setPopUp] = useState<boolean>(false);
	const privMsg = () =>
    {
        let myid: number;
        let chName: string;
        const fetchMe = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            const res = await response.json();
            myid = res.id;
            if (myid > friend.id)
                chName = friend.id + "-" + myid;
            else
                chName = myid + "-" + friend.id;

            const chcreateRes = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${chName}/create/true/false/undefined`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                    'Content-Type': 'application/json'
                }
            })
        }
        fetchMe();
    }
    const ignorePerson = async () =>
    {
        const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/ignoreUser/${friend.nick}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            if(response.ok)
                setStatus(++status);
        }
        fetchData();
    }
    const [name, setName] = useState<string>("");
    const chName = (e) =>{
        setName(e.target.value);
    }
    const popUp = () =>{
        setPopUp(true);
    }
    const chInvite = () =>
    {
        const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${name}/inviteChannel/${friend.nick}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
        }
        fetchData()

    }
    const handleXClick = () =>{
        setPopUp(false);
    }
    return(
            <div className="friendOnePerson">
                <div className="friendLink">
                    <Link className="link" to={`/profile?nick=${friend.nick}`} ><span>{friend.nick}</span></Link>
                </div>
                <div className="friendStatus">
                    {friend.Status === "Online" ? (<div className="on" />):(null)}
                    {friend.Status === "Offline" ? (<div className="off" />):(null)}
                    {friend.Status === "In-Game" ? (<div className="gameIn" />):(null)}
                </div>
                <div className="friendIcons">
                    <img className="friendIcon"onClick={privMsg} src={messageIcon} alt="a"/>
                    <img className="friendIcon"onClick={ignorePerson} src={ignoreIcon} alt="b"/>
                    <Link className="link" to={`/?id=${friend.id}`} ><img className="friendIcon"src={gameInvite} alt="c"/></Link>
                    <img className="friendIcon"onClick={popUp} src={invite} alt="d"/>
                </div>
                {
                    isPopUp === true ? (
                        <div>
                            <div className="messageInvite">
                                <div className="messageInviteX">
                                    <button onClick={handleXClick}>X</button>
                                </div>
                                <div className="messageInviteBody">
                                    <div className="messageInviteLabel">
                                        <label>Kanal İsmi</label>
                                    </div>
                                    <div className="messageInviteInput">
                                        <input type="text" id="channelName" onChange={chName}></input>
                                    </div>
                                    <div className="messageInviteButton">
                                        <button onClick={chInvite}>Davet Et</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ):
                    (null)
                }

            </div>
    )
}
export default Friend;
