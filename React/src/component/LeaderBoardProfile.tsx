import React from "react";
import addPerson from "../images/addPerson.png";
import ignore from "../images/ignore.png";
import msg from "../images/message.png";
import { Link } from "react-router-dom";
import { cookies } from "../App";

const LeaderBoardProfile = ({index, user, myid}) =>{
	const addClick = () =>{
		const fetchData = async () =>{
            const response: any = await fetch(`https://${process.env.REACT_APP_IP}:80/user/findUser/${user.nick}`, {///
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            const res = await response.json();
            alert(res.message);
        }
        fetchData();
	}
	const ignoreClick = () =>{
		const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/ignoreUser/${user.nick}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
			if(response.ok)
				alert("The Person ignored");
        }
        fetchData();
	}
	const handleClick = () =>{
		// let myid: number;
        let chName: string;
        const fetchMe = async () =>{
            // const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user`, {
            //     headers: {
            //         'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
            //     }
            // })
            // const res = await response.json();
            // myid = res.id;
            if (myid > user.id)
                chName = user.id + "-" + myid;
            else
                chName = myid + "-" + user.id;

            const chcreateRes = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${chName}/create/true/false/undefined`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                    'Content-Type': 'application/json'
                }
            })
        }
        fetchMe();
	}
	return(
		<div>
			<div className="lBblock">
				{/* {item(Leaderboard)} */}
				<div className="item1">
					<h3 className="lBH3">{index + 1} .  </h3>
					<img className="lBImage" src={`data:image/png;base64,${user.imgBuffer}`} alt=""/>
					<div className="info">
						<Link className="link" to={`/profile?nick=${user.nick}`}><h3 className="lBH3">{user.nick}</h3></Link>
						<span className="lBSpan">{user.LatterLevel}</span>
					</div>
				</div>
				{/* <div className="itemIcon">
					<img src={addPerson} alt="" onClick={addClick} />
				</div>
				<div className="itemIcon">
					<img src={ignore} alt="" onClick={ignoreClick} />
				</div> */}
				{/* <div className="itemIcon">
					<Link className="link" to={`/chat`} ><img onClick={handleClick} src={msg} alt="" /></Link>
				</div> */}
				{user.id !== myid ? (
				<>
					<div className="itemIcon">
						<img src={addPerson} alt="" onClick={addClick} />
					</div>
					<div className="itemIcon">
						<img src={ignore} alt="" onClick={ignoreClick} />
					</div>
					<div className="itemIcon">
						<Link className="link" to={`/chat`}><img onClick={handleClick} src={msg} alt="" /></Link>
					</div>
					</>
				) : (<>
					<div className="itemIcon">
						<span />
					</div>
					<div className="itemIcon">
						<span />
					</div>
					<div className="itemIcon">
						<span />
					</div>
					</>)}
				<div className="item2">
					<div>
						<span className="itemSpan">Win</span>
						<span className="valueSpan">{user.WinCount}</span>
					</div>
					<div>
						<span className="itemSpan">Lose</span>
						<span className="valueSpan">{user.LoseCount}</span>
					</div>
				</div>
			</div>
		</div>

	)
}
export default LeaderBoardProfile;
