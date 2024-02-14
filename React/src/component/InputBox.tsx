import React, { useState } from "react";
import {socket} from "../pages/Home";
import send from "../images/send.png"

const InputBox = ( {currentChannel} ) =>{
  const dValue = document.getElementById('sendInput') as HTMLInputElement;

  const [inputValue, setInputValue] = useState<string>("");
  const HandleClick = async () => {
    if (inputValue){
      socket.emit('chat', {message: inputValue, channelName: currentChannel});
    }
    dValue.value = '';
    setInputValue('');
  }
  const change = (e) =>{
    setInputValue(e.target.value);
  }
  const keyDown = (e) =>{
    if (e.key === 'Enter')
    {
      HandleClick();
      dValue.value = '';
      setInputValue('');
    }
  }
    return(
        <div className="messageBoxInput">
          <input className="input" id="sendInput" type="text" onKeyDown={keyDown} onChange={change} placeholder="Type something..."/>
          <div className="send">
            <button onClick={HandleClick} className="mBBtn"><img className="sendImage" src={send} alt="s" /></button>
          </div>
        </div>
    )

}

export default InputBox;
