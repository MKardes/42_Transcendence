import React from "react";
import Messages from "./Messages";

const MessageBox = ({currentChannel, user}) =>{

	return(
		<div className="messageBox">

			<div className="messageBoxInfo">
				<span>{currentChannel}</span>
			</div>
			<div>
				<Messages currentChannel={currentChannel} user = {user} />
			</div>

		</div>
	)

}

export default MessageBox;
