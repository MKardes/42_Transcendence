import React from "react";

const PrivChannel = ({channel, setCurrentChannel}) =>{
    const HandleClick = async () => {
        setCurrentChannel(channel.Name);
    }
    return(
        <div className="userChat">
		    <div className="userChatChannel">
                <div className="userChatInfo">
			        <img className="searchChatImage" src={`data:image/png;base64,${channel.imgBuffer}`}/>
                    <span  className="chatInfoSpan" onClick={HandleClick} >{channel.Users !== undefined? channel.Users[0].nick : undefined}</span>
                </div>
            </div>
		</div>
    )
}
export default PrivChannel;
