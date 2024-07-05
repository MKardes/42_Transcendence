import React, { useState } from "react";
import { cookies } from "../App";
import j42 from "../images/42.jpeg";

const Form = ({user, setUser, setIsFormSigned, formType, setChgAvatar}) => {
	const [selectedImage, setSelectesImage] = useState("");
	const [reader, setReader] = useState<any>();
	const [nick, setNick] = useState("");
    const [error, setError] = useState<string>("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
		setNick(e.target.value);
	};
    const handleImageChange = (e) =>{
		const selectedFile = e.target.files[0];
        if (selectedFile === undefined)
        {
            setSelectesImage("");
            setError("");
            return;
        }
        const fileSizeInKB = selectedFile.size / 1024; // Convert bytes to KB
		const fileReader = new FileReader();

        if (fileSizeInKB < 72)
        {
            setError("");
            fileReader.onload = (ea: any) => {
                const dataURL = ea.target.result;

                setSelectesImage(URL.createObjectURL(selectedFile));
                setReader(dataURL);
            };
            fileReader.readAsDataURL(selectedFile);
        }
        else {
            setError("Please put an image lower then 72kb!");
        }
	}
	const handleSubmit = async (e: React.FormEvent) =>{
		e.preventDefault();
        const data = {};
        data["file"] = reader;
        const sendForm = async () => {
            if (error === "")
            {
                try {
                    data["nick"] = nick;
                    const responseImage = await fetch(`http://${process.env.REACT_APP_BACK_URL}/user/form`, {
                        method: 'POST',
                        headers: {
                            'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify( data ),
                    });
                    const responseImageGet = responseImage.json();
                    if (responseImage.ok){
                        setIsFormSigned(true);
                        await fetch(`http://${process.env.REACT_APP_BACK_URL}/user/sign`, {
                            headers: {
                                'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                            }
                        });
                        console.log('Form submitted successfully');
                    }
                    else{
                        console.error('Form submission failed!');
                    }
                }
                catch(error){
                    console.error('An error occurred:', error);
                }
            }
        }
        const changeAvatar = async () => {
            try {
                const responseImage = await fetch(`http://${process.env.REACT_APP_BACK_URL}/user/changeAvatar`, {
                    method: 'POST',
                    headers: {
                        'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify( data ),
                });
                responseImage.json();
                if (responseImage.ok){
                    user.imgBuffer = selectedImage;
                    setUser(user);
                    setChgAvatar(false);
                    console.log('Avatar changed successfully.');
                }
                else{
                    console.error('Avatar changing failed!');
                }
            }
            catch(error){
                console.error('An error occurred:', error);
            }
        }
		if ( formType === "SendForm" )
            sendForm();
		if ( formType === "ChangeAvatar" )
            changeAvatar();
	};
    const changeAvatarClose = () => {
        setChgAvatar(false);
    }
    return (<>
        {
            formType === "ChangeAvatar" ? (
            <div className="changeAvatar">
                <button className="changeAvatarX" onClick={changeAvatarClose}>X</button>
                <div className="formHeader">
                    <h2 className="homeForm">Select Avatar</h2>
                </div>
                <div className="formBody">
                    <form>
                        <div className="formDiv">
                        <input id = "fileInput" type="file" name="image" accept="images/*" onChange={handleImageChange}/>
                        </div>
                        <p className="ImageError">{error}</p>
                        <button type="submit" onClick={handleSubmit}>Send</button>
                    </form>
                </div>
            </div>
            ):(
            <div className="form">
                <div className="formHeader">
                    <h2 className="homeForm">Select NickName and Avatar</h2>
                </div>
                <div className="formBody">
                    <form>
                        <div className="formDiv">
                            <label>Nickname: </label>
                        <input type="text" name="name" placeholder={user.nick} onChange={handleChange}></input>
                        <input  id = "fileInput" type="file" name="image" accept="images/*" onChange={handleImageChange}/>
                        {
                            selectedImage !== "" ? (
                                <div>
                                <h3>Select Avatar</h3>
                                <img src={selectedImage} alt="" className="formImage"></img>
                            </div>
                            ): null
                        }
                        <p className="ImageError">{error}</p>
                        <button type="submit" onClick={handleSubmit}>Send</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    )
}

export default Form;
