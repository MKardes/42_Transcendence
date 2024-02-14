import React from "react";


const Message = ({message, user}) =>{
    return(
        <div>
            {
                user.nick === message.senderNick ? (
                    <div className="message owner">
                        <div className="messageInfo">
                           <span>{message === undefined ? "" : message.senderNick}</span>
                        </div>
                        <div className="messageContent">
                            <p className="messageP">{message === undefined ? "" : message.message}</p>
                            {/* <img className="mIImg" src={image2} alt="dneeme"/> */}
                        </div>
                    </div>

                ):
                (
                    <div className="message">
                        <div className="messageInfo">
                           <span>{message === undefined ? "" : message.senderNick}</span>
                        </div>
                        <div className="messageContent">
                            <p className="messageP">{message === undefined ? "" : message.message}</p>
                            {/* <img className="mIImg" src={image2} alt="dneeme"/> */}
                        </div>
                    </div>

                )
            }
    </div>
    )
}
export default Message;
