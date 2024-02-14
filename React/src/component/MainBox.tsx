import React from "react";
import MessageBox from "./MessageBox";
import InputBox from "./InputBox";

const MainBox = ({currentChannel, user}) =>{
    return(
        <div className="mainBox">
          <MessageBox currentChannel={currentChannel} user = {user} />
            <InputBox currentChannel={currentChannel} />
        </div>
    )

}

export default MainBox;
