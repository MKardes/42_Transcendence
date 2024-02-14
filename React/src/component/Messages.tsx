import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { cookies } from "../App";
import { socket } from "../pages/Home";

// const messes = [{message: "asdsadsad",senderNick: "ssss"},{message: "asdasd",senderNick: "sss"}]
const Messages=({currentChannel, user}) =>{
    const [messagesReceived, setMessagesReceived] = useState<{message: string, channelName: string, senderNick: string}[]>([]);
    // data = {message: string, channelName: string, senderNick: string}
    socket.on('chat', async (data) => {
        if (data.channelName === currentChannel)
            setMessagesReceived([...messagesReceived, data]);
    });
    useEffect(() => {
        const fetchData = async () =>{
            const responseMessages = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/${currentChannel}/messages`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            });
            const res = await responseMessages.json();
            let Mess: {message: string, channelName: string, senderNick: string}[];
            if (res.msg === "The channel to see messages is not be founded!")
                Mess = [];
            else
                Mess = res;
            setMessagesReceived(Mess);
        }
        if (currentChannel !== ""){
            fetchData();
        }
        else {
            const Mess:  {message: string, channelName: string, senderNick: string}[] = [];
            setMessagesReceived(Mess);
        }

    },[currentChannel])
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() =>{
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
          }
    },[messagesReceived])
    return(
        // messagesReceived.length > 0 ?
            <div className="messages">
                {messagesReceived.map((message, index) => (
                    <Message key={index} message={message} user = {user} />
                ))}
            <div ref={bottomRef}/>
            </div>
        // : (null)
    )
}
// never shall we die
export default Messages;
