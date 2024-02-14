import React from "react";
import SidebarNav from "./SidebarNav";
import ChatSearch from "./ChatSearch";
const Sidebar = ({setCurrentChannel}) =>{

    return(
        <div className="sidebar">
            <SidebarNav/>
            <ChatSearch setCurrentChannel={setCurrentChannel} />
        </div>
    )

}

export default Sidebar;
