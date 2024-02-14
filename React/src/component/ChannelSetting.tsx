import React, { useState } from "react";
import { cookies } from "../App";

const ChannelSetting = ({setPopOpen, channelName}) =>{
	const [pass, setPass] = useState<string>("undefined");
	const [check, setCheck] = useState<boolean>(false);
	const [Process, setProcess] = useState<string>();

	const changeCheckPass = (e) =>{
		setCheck(true);
		setProcess(e.target.id)
	}
	const changePass = (e) =>{
		if (!e.target.value)
			setPass("undefined");
		else{
			setPass(e.target.value);
		}
	}

	const send = async () =>{
		switch (Process)
			{
				case "set":
					{
						const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${channelName}/setChannelPassword/${pass}`, {
							headers: {
								'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
							}
						})
						break;
					}
					case "change":
					{
						const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${channelName}/changeChannelPassword/${pass}`, {
							headers: {
								'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
							}
						})
						break;
					}
					case "remove":
					{
						const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${channelName}/removeChannelPassword`, {
							headers: {
							'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
							}
						})
						break;
					}
				default:
					console.log(Process);
			}
	}
	const handleClick = () =>{
		setPopOpen(false);
	}
	return(
		<div>
			<div className="channelSetting" id="popActive" style={{ display: setPopOpen  ? 'block' : 'none' }}>
				<div className="channelSettingX">
					<button onClick={handleClick}>X</button>
				</div>
				<div className="channelSettingForm">
					<div className="settingLeft">
						<div  className="sLeftLabel">
							<label>ChannelName</label>
						</div>
						<div  className="sLeftLabel">
							<label >Select</label>
						</div>
						<div  className="sLeftLabel">
							<label>Password</label>
						</div>
					</div>
					<div className="settingRight">
						<div>
							<label>{channelName}</label>
						</div>
						<div className="ticDiv" >
							<label className="tic" >Set Pass<input type="radio" name="radioGroup" id="set" onChange={changeCheckPass} /></label>
							<label className="tic">Remove Pass<input type="radio" name="radioGroup" id="remove"  onChange={changeCheckPass}/></label>
							<label className="tic">Change Pass<input type="radio" name="radioGroup" id="change"  onChange={changeCheckPass}/></label>
						</div>
						<div>
							{
								Process !== "remove" ? (<input type="password" id="password" onChange={changePass} placeholder="No Password" />):(null)
							}

						</div>
					</div>
				</div>
					<button onClick={send}>Change Pass</button>
			</div>
		</div>
	)
}

export default ChannelSetting;
