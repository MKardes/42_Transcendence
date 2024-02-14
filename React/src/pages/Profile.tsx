import React, {useEffect, useState} from "react";
import edit from "../images/edit.png";
import nickOk from "../images/nickOk.png";
import x from "../images/close.png";
import { cookies } from "../App";
import TFA from "../component/TFA";
import ToggleSwitch from "../component/ToggleSwitch";
import { Link, useLocation } from "react-router-dom";
import achievement from "../images/achievement.png";
import firstWin from "../images/firstWin.png";
import w5wL from "../images/w5wL.png";
import w10wL from "../images/w10wL.png";
import ach3 from "../images/ach2.png";
import ach5 from "../images/ach5.png";

import Form from "../component/Form";

const Profile = () => {

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const nick = searchParams.get('nick');
	const [chgAvatar, setChgAvatar] = useState<boolean>(false);
	const [newNick, setNewNick] = useState<string>("");
	const [user, setUser] = useState<any>({imgBuffer: undefined});
	const [isTFAPopUp, setIsTFAPopUp] = useState<boolean>(false);
	const [isSettingPopUp, setSettingPopUp] = useState<boolean>(false);
	const [toggleState, setToggleState] = useState<boolean>(false);
    const [QR, setQR] = useState("");
	const [isHovered, setHovered] = useState<boolean>(false);

	useEffect (() =>{
		if (nick !== null)
		{
			const fetchData = async () => {
				const responseUser = await fetch(`https://${process.env.REACT_APP_IP}:80/user/profile/${nick}`, {
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				});
				const resUser = await responseUser.json();
				if (responseUser.ok)
					setUser(resUser);
				else
					alert("The user could not be found!");
			}
			fetchData();
		}
		else{
			const fetchData = async () =>{
				const responseUser = await fetch(`https://${process.env.REACT_APP_IP}:80/user/profile`, {
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				});
				const resUser = await responseUser.json()
				setToggleState(resUser.TFAuth);
				setUser(resUser);
			}
			fetchData();
		}
	}, [nick, chgAvatar])// [nick,user] was there but there is a risky movement like while(1) infinite loop

	const handleToggleChange = async (isChecked: boolean) => {
		if (isChecked === true)
		{
			const response = await fetch(`https://${process.env.REACT_APP_IP}:80/auth/tfa/enable`, {
				headers: {
					'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
				}
			})
			const qrCodeImageData = await response.blob();
			const imageUrl = URL.createObjectURL(qrCodeImageData);
			setQR(imageUrl);
			setIsTFAPopUp(true);
			cookies.set("Xcasfhajsd","kjshdfi23qwd");
		}
		else
			await fetch(`https://${process.env.REACT_APP_IP}:80/auth/tfa/disable`, {
				headers: {
					'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
				}
			})
		setToggleState(isChecked);
	};

	const changeName = (e) =>{
		setSettingPopUp(true);
	}
	const close = () =>{
		setSettingPopUp(false);
	}
	const handleChange =(e:React.ChangeEvent<HTMLInputElement>)=>{
		if((e.target.value).length < 11)
		{
			setNewNick(e.target.value);
		}
		else
			alert("new nick");
	}
	const send = () =>{
		const fetchData = async () =>{
			const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/changeNick/${newNick}`, {
				headers: {
					'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
				}
			});
			if (response.ok)
			{
				setNewNick(newNick);
				setUser(prevUser => ({ ...prevUser, nick: newNick }));
			}
			else{
				const res = await response.json();
				alert(res.error)
			}
		}
		fetchData();
		setSettingPopUp(false);
	}

	const changeAvatar = () => {
		setChgAvatar(true);
	}

	return(
		<div className="Profile">
			{
				isTFAPopUp === true  ?
				(
					<div className="tfa_visible">
						<TFA qr={QR} setIsTFA={setToggleState} setIsTFAPopUp={setIsTFAPopUp} />
					</div>
				):(
					<div className="profile">
						<div className="profileH1">
							<h1>Profile</h1>
						</div>
						{chgAvatar === true ? (<>
							<Form user={user} setUser={setUser} setIsFormSigned={undefined} formType={"ChangeAvatar"} setChgAvatar={setChgAvatar}/>
						</>) : null }
						<div className="profileContainer">
							<div className="pTopBlock">
								{user.imgBuffer !== undefined ? (<img className="pTopBlockImage" src={`data:image/png;base64,${user.imgBuffer}`} alt="pImage"/>): null}
								{nick === null ? (<img onClick={changeAvatar} className="imageSetting" src={edit}/>):(null)}
							</div>
							<div className="pBottomBlock">
								{nick === null ? (
									<div className="pIconBlock">
										<div className="pIconBlockPosition">
											<div>
												<label className="pIconLabel">TFA</label>
											</div>
											<div className="toogleContainer">
												<ToggleSwitch checked={toggleState} onChange={handleToggleChange} />
											</div>
										</div>
									</div>
								):
								(null)}
								<div className="pValueBlock">
									<div className="leftBlock">
										<div className="pRowBlock">Nick</div>
										<div className="pRowBlock">Latter Level</div>
										<div className="pRowBlock">Win</div>
										<div className="pRowBlock">Lose</div>
									</div>
									<div className="rightBlock">
										<div className="pRowBlock" id="changeNameId">
										{ isSettingPopUp === false?
											(<label className="settingIcon">{user.nick}
											{
												nick === null?(<img onClick={changeName} className="setting" src={edit}/>):(null)
											}</label>):
											(<label className="settingIcon"><input type="text" name="name" onChange={handleChange}></input><img onClick={send} src={nickOk} className="setting"/><img onClick={close} src={x} className="setting"/></label>)
										}
										</div>
										<div className="pRowBlock">{user.LatterLevel}</div>
										<div className="pRowBlock">{user.WinCount}</div>
										<div className="pRowBlock">{user.LoseCount}</div>
									</div>
								</div>
								<div className="match">
									<Link to={`/profile/matchHistory?nick=${nick}`} className="link" ><label>Match History</label></Link>
								</div>
								{
									user.imgBuffer ? (
										<div className="achvBlock">
											{ user.Achievements.Ac1 ===  true ? (<div onMouseOver={() => setHovered(true)} onMouseOut={()=> setHovered(false)}><img src={firstWin} alt="a" />{isHovered && <p>First Win</p>}</div>):(null) }
											{ user.Achievements.Ac2 ===  true ? (<div onMouseOver={() => setHovered(true)} onMouseOut={()=> setHovered(false)}><img src={ach5} alt="a" />{isHovered && <p>First Lose</p>}</div>):(null) }
											{ user.Achievements.Ac3 ===  true ? (<div onMouseOver={() => setHovered(true)} onMouseOut={()=> setHovered(false)}><img src={achievement} alt="a" />{isHovered && <p>Win 10 times</p>}</div>):(null) }
											{ user.Achievements.Ac4 ===  true ? (<div onMouseOver={() => setHovered(true)} onMouseOut={()=> setHovered(false)}><img src={w5wL} alt="a" />{isHovered && <p>Win 5 games without Losing</p>}</div>):(null) }
											{ user.Achievements.Ac5 ===  true ? (<div onMouseOver={() => setHovered(true)} onMouseOut={()=> setHovered(false)}><img src={w10wL} alt="a" />{isHovered && <p>Win 10 games without Losing</p>}</div>):(null) }
											{ user.Achievements.Ac6 ===  true ? (<div onMouseOver={() => setHovered(true)} onMouseOut={()=> setHovered(false)}><img src={ach3} alt="a" />{isHovered && <p>Win without conceding any goals</p>}</div>):(null) }
										</div>
									): (null)
								}
							</div>
						</div>
					</div>
					)
				}
			</div>
	)
}

export default Profile;
