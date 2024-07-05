import React, { useState, useEffect } from 'react';
import L42 from '../images/42icon.png';
import { cookies } from '../App';
import TFAVerify from '../component/TFAVerify';
import { socket } from './Home';
import { useLocation, useNavigate } from 'react-router-dom';



export const Login = ({setUser, isTFAStatus, setIsTFAStatus, setMaxSocket, setIsFormSigned}) => {
	const location = useLocation();
	const navigate = useNavigate();
	const [isPressed, setIsPressed] = useState<boolean>();

	useEffect(() => {
		console.log("Login");
		const fetchData = async () => {
			const searchParams = new URLSearchParams(location.search);
			const code = searchParams.get('code');

			const handleRemoveQueryParam = () => {
				const searchParams = new URLSearchParams(location.search);
				searchParams.delete('code');
				const newSearchString = searchParams.toString();
				navigate({
					search: newSearchString,
				});
			};

			if(code)
			{

				const data = {}
				data['code']= code;

				const response = await fetch(`http://${process.env.REACT_APP_BACK_URL}/auth/42/signin_intra`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify( data ), // Assuming code is an object
				});
				const responseData = await response.json();
				// {token: Jwt_Token,  result: 0} The new user has been saved in database and the token has been created.
				// {token: Jwt_Token,  result: 1} The user has already been saved in database and the token has been created.
				// {token: Jwt_Token,  result: 2} The user should be redirected to the TFA page.
				// {token: return_msg, result:-1} The user couldn't log in.
				handleRemoveQueryParam();
				if (responseData.result === -1)
				{
					alert("You couldn't log in!!");
					return;
				}
				const responseIsConnected = await fetch(`http://${process.env.REACT_APP_BACK_URL}/chat/isConnected`, {
					headers: {
						'authorization': 'Bearer ' + responseData.token,
					},
				});
				const IsConnected = await responseIsConnected.json();
				if (IsConnected.res === 1)
				{
					alert(IsConnected.msg);
					setMaxSocket(true);
					return;
				}
				setMaxSocket(false);
				await fetch(`http://${process.env.REACT_APP_BACK_URL}/chat/connect`, {
					headers: {
						'socket-id': socket.id,
						'authorization': 'Bearer ' + responseData.token,
					},
				});
				cookies.set("jwt_authorization", responseData.token);
				if(responseData.result === 2)
				{
					setIsTFAStatus(true);
					return;
				}
				const responseUser = await fetch(`http://${process.env.REACT_APP_BACK_URL}/user`, {
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				});
				const UserData = await responseUser.json();
				setUser(UserData);
				if(UserData.IsFormSigned){
					setIsFormSigned(true);
				}
			}
			if(isPressed === true){
				const resIsSigned = await fetch(`http://${process.env.REACT_APP_BACK_URL}/user/isSigned`, {
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				});
				const IsSigned = await resIsSigned.json();
				if (IsSigned === true)
					setIsFormSigned(true);
			}
		}
		fetchData();
	}, [isPressed]);



// const handleFTLogin = () => {
//         function messageHandler (event: MessageEvent<any>){
//             if(event.origin === process.env.REACT_APP_REDIRECT_URI){
//                 const data = event.data;
//                 if (data.message === 'popupRedirect'){
//                     navigate('/?code=' + data.additionalData, {replace: true});
//                     window.removeEventListener('message', messageHandler);
//                 }
//             }
//             setIsPressed(true);
//         }
//         window.addEventListener('message', messageHandler);
//         window.open(process.env.REACT_APP_FT_API, "intraPopUp", "width=500, height=300");
//     };
	const handleFTLogin = () => {
		window.location.href=(process.env.REACT_APP_FT_API);
	};
	const calculateTransform = (index) => {
		const degree = 7.2 * index;
		return `rotate(${degree}deg) translate(300px) rotate(${0}deg)`;
	  };
	const spanCount = 50;

  	const spans = Array.from({ length: spanCount }, (_, index) => (
   	 <span key={index} style={{ '--i': index, transform: calculateTransform(index)}} className="blinking-span"></span>
 	 ));
	return (
		<div className='login'>
		{
			isTFAStatus === true ?
			(<TFAVerify setIsTFAStatus={setIsTFAStatus} setUser={setUser} setIsFormSigned={setIsFormSigned}/>):
			(<div className="wrapper">
				<div className='login-box'>
					<div className="loginButton" onClick={handleFTLogin}>
						<img src={L42} alt="" className="icon" />
						Login
					</div>
				</div>
				{spans}
			</div>
			)
		}
		</div>
  );
};

export default Login;
