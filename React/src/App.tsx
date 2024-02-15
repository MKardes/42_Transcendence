import React, {useState, useEffect} from 'react';
import './App.scss';
import Navbar from './component/Navbar';
import Home, { socket } from './pages/Home';
import Login from './pages/Login';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Profile from './pages/Profile';
import LeaderBoard from './pages/LeaderBoard';
import Chat from './pages/Chat';
import Cookies from 'universal-cookie';
import MatchHistory from './component/MatchHistory';


export const cookies = new Cookies();

function App() {
	const [currentChannel, setCurrentChannel] = useState("");
	const [user, setUser] = useState({res: "undefined"});
	const [isTFAStatus, setIsTFAStatus] = useState(false);
	const [maxSocket, setMaxSocket] = useState(true);
	const [isFormSigned, setIsFormSigned] = useState(false);

	useEffect(() => {
		console.log("APP");
		const fetchData = async () => {
			socket.on("connect", async () => {
				const token = cookies.get("jwt_authorization");
				if (token !== undefined){
					const responseIsConnected = await fetch(`https://${process.env.REACT_APP_IP}:80/chat/isConnected`, {
					headers: {
						'authorization': 'Bearer ' + token,
					},
					});
					const IsConnected = await responseIsConnected.json();
					if (IsConnected.res === 1)
					{
						alert(IsConnected.msg);
						setMaxSocket(true);
						return;
					}
					else
						setMaxSocket(false);
					await fetch(`https://${process.env.REACT_APP_IP}:80/chat/connect`, {
						headers: {
							'socket-id': socket.id,
							'authorization': 'Bearer ' + token,
						},
					});
				}
			});
			if ( cookies.get("jwt_authorization") === "undefined")
			{
				setUser({res: "undefined"});
				return;
			}
			const responseUser = await fetch(`https://${process.env.REACT_APP_IP}:80/user/checkJWT`, {
				headers: {
					'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
				}
			});
			const res = await responseUser.json();
			if ( res.TFAuth === false || (res.TFAuth === true && cookies.get("Xcasfhajsd") === "kjshdfi23qwd"))
				setIsTFAStatus(false);
			else if (res.TFAuth === true)
				setIsTFAStatus(true);
			if(res === false)
			{
				cookies.remove('jwt_authorization')
				setUser({res: "undefined"});
				return;
			}
			setUser({...res, res: "user"});
			const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/isSigned`, {
				headers: {
					'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            });
            const IsSigned = await response.json();
			if (IsSigned === true)
				setIsFormSigned(true);
		}
		fetchData();
	}, []);
	return (
		<BrowserRouter>
		<div className='body'>
			<Navbar user={user} setUser={setUser} maxSocket={maxSocket} isFormSigned={isFormSigned}/>
			<Routes>
			{
				 user.res !== "undefined" && maxSocket !== true && isTFAStatus !== true ?
				 (<>
				 	<Route path='/*' element = {<Home user={user} isFormSigned={isFormSigned} setIsFormSigned={setIsFormSigned}/>} />
				 	<Route path="/profile" element={<Profile />} />
				 	<Route path="/leaderboard" element={<LeaderBoard user={user} />} />
				 	<Route path='/chat' element={<Chat setCurrentChannel={setCurrentChannel} currentChannel={currentChannel}/>}/>
				 	<Route path='/profile/matchHistory' element={<MatchHistory />} />
				 </>) : (<>
					<Route path='/*' element={<Login setUser = {setUser} isTFAStatus={isTFAStatus} setIsTFAStatus={setIsTFAStatus} setMaxSocket={setMaxSocket} setIsFormSigned={setIsFormSigned}/>}/>
				</>
				)
			}
			</Routes>
		</div>
		</BrowserRouter>
		);
}

export default App;
