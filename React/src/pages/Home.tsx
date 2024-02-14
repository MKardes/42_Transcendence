import React, {useState, useEffect, Component} from "react";
import io from "socket.io-client";
import Game from "../component/Game";
import Form from "../component/Form";

export const socket = io(`https://${process.env.REACT_APP_IP}:80`, {
	transports: ['websocket']
});

const Home = ({user, isFormSigned, setIsFormSigned}) =>{
	console.log("Home	")
	console.log(user)
	if(user !== undefined && user.isFormSigned){
		setIsFormSigned(true);
		console.log("FormSigned	")
	}
	return(
		<div className="home">
		{
			isFormSigned ? 
				<Game user={user}/>
			:
				<Form user={user} setUser={undefined} setIsFormSigned={setIsFormSigned} formType={"SendForm"}/>
		}
		</div>
	)
}

export default Home;
