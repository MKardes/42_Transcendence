import React, { useState } from "react";
import { cookies } from "../App";

const ChannelCreate = ({setPopOpen, channelList, setChannelList}) =>{
	const [inputValue, setInputValue] = useState<string>("");
	const [pass, setPass] = useState<string>("undefined");
	const [inv, setInv] = useState<boolean>(false);

	const send = async () =>{
		if (inputValue)
		{
			const response = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${inputValue}/create/false/${inv}/${pass}`, {
				headers: {
					'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					'Content-Type': 'application/json'
				}
			})
			const ch = await response.json();
			const UpdateChannel = [...channelList, ch]
			setChannelList(UpdateChannel);
			setPopOpen(false);
		}
	}
	const handleClick = () =>{
		setPopOpen(false);
	}
	const hasSpecialCharacters = str => /[!@#$%^&*(),.?":{}|<>\/\\  ]/.test(str);
	const changeName = (e) =>{
		//CH NAME CHECK (.#?/\...)
		if (e.target.value && hasSpecialCharacters(e.target.value)) {
			alert("Special Characters Error!")
			e.target.value = "";
		  } else {
			setInputValue(e.target.value);
		  }
	}
	const changePass = (e) =>{
		console.log(e.target.value);
		if (e.target.value && hasSpecialCharacters(e.target.value)) {
			alert("Special Characters Error in Password!");
			e.target.value = "";
			setPass("undefined");
		}
		else
		{
			if (!e.target.value)
				setPass("undefined");
			setPass(e.target.value);
		}
	}
	const changeInvite = (e) =>{
		setInv(e.target.checked);
	}
	return(
		<div>
			<div className="channelCreate" id="popActive" style={{ display: setPopOpen  ? 'block' : 'none' }}>
				<div className="channelCreateX">
					<button onClick={handleClick}>X</button>
				</div>
				<div className="channelCreateBody">
					<div className="channelForm">
						<div className="channelFormLeft">
							<div className="channelFormLabel">
								<label>Channel Name</label>
							</div>
							<div className="channelFormLabel">
								<label>Password</label>
							</div>
							<div className="channelFormLabel">
								<label>invite only</label>
							</div>
						</div>
						<div className="channelFormRight">
							<div>
								<label htmlFor="channelName"></label>
								<input type="input" id="channelName" onChange={changeName}/>

							</div>
							<div>
								<input type="password" id="password" onChange={changePass} placeholder="No Password" />
							</div>
							<div>
								<label htmlFor="inviteCheck"></label>
								<input className="formInviteCheck" id="inviteCheck" type="checkbox" onChange={changeInvite}/>
							</div>
						</div>
					</div>
				<button onClick={send}>Create/Join Channel</button>
				</div>
			</div>
		</div>
	)
}

export default ChannelCreate;
