import React, { useEffect, useState } from "react";
import Friend from "./Friend";
import { cookies } from "../App";
import find from "../images/find.png";
import { socket } from "../pages/Home";

const FriendsSidebar = () => {
    const [friendLists, setFriendLists] = useState<{}[]>([]);
    const [finds, setFinds] = useState<string>();
    const [status, setStatus] = useState<number>(0);
    const dValue = document.getElementById('search') as HTMLInputElement;

    socket.on("Friend Status", () => {
        setStatus(status + 1);
    })
    useEffect(() => {
        const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/friends`, {///
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            setFriendLists(await response.json());
        }
        fetchData();
    }, [status])

    const change = (e) =>{
        setFinds(e.target.value);
    }
    const keyDown = (e) =>{
        if(e.key === 'Enter'){
            handleClick ();
            dValue.value = '';
            setFinds('');
        }
    }

    const handleClick = () =>{
        if (finds){
            const fetchData = async () =>{
                const response: any = await fetch(`https://${process.env.REACT_APP_IP}:80/user/findUser/${finds}`, {///
                    headers: {
                        'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                    }
                })
                const res = await response.json();
                alert(res.message);
            }
            fetchData();
        }
        setFinds('');
        dValue.value = '';
    }
	return(
        <div className="friendContainer">
            <div className="sidebarNav">
                <span className="sidebarLogo">Friends</span>
            </div>
            <div className="friendsMain">
                <div className="friendSearchForm">
                     <input id="search" className="searchInput" type="text" placeholder="find a user" onKeyDown={keyDown} onChange={change}/><div onClick={handleClick} className="searchButton"><img src={find} alt="find" /></div>
                </div>
                {friendLists.map((friend, index) => (
                    <Friend key={index} friend={friend} status setStatus={setStatus}/>
                ))}
            </div>
        </div>
	)
}

export default FriendsSidebar;
