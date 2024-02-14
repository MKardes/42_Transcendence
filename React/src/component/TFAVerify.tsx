import React, { useState } from "react";
import { cookies } from '../App';

const TFAVerify = ({setIsTFAStatus, setUser, setIsFormSigned}) =>{
    const [value, setValue] = useState<string>("");
    const click = async (e)=>{
        e.preventDefault();
        const stringValue: string = value.toString();
        const responseVerify = await fetch(`https://${process.env.REACT_APP_IP}:80/auth/tfa/verify/${stringValue}`, {
            headers: {
                'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
            }
        });
        // obj {res: 0}
        // obj {res: 1, code: "TFA enabled"}
        const obj = await responseVerify.json();
        if(obj.res === 0)
        {
            const responseUser = await fetch(`https://${process.env.REACT_APP_IP}:80/user`, {
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				});
            const UserData = await responseUser.json();
			setUser(UserData);
            if(UserData.IsFormSigned)
                setIsFormSigned(true);
			setIsTFAStatus(false);
			cookies.set("TFAStatus","Passed");
		    console.log("Passed TFAVerify");
        }
    }
    const HandleChange = (e) => {
        const inputValue = e.target.value;
        // Use a regular expression to allow only up to 6 numerical digits
        const sanitizedValue = inputValue.replace(/\D/g, '').slice(0, 6);
        setValue(sanitizedValue);
      }
    return(
        <div className = "tfa-container" id="tfa-block">
				<h1 className="tfa-h1"> TFA </h1>
				<p className="tfa-p">6 haneli kodu giriniz...</p>
                <div >
                    <input value={value} onChange={HandleChange} className="tfa-input" inputMode="numeric"  maxLength={6}/>
                </div>
                <div>
                    <button onClick={click}  className="tfa-button" type="submit">Send</button>
            </div>
        </div>
    )
}

export default TFAVerify;
