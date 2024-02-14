import React, { useEffect, useState } from "react";
import { cookies } from "../App";
import MatchHistoryList from "./MatchHistoryList";
import {useLocation } from "react-router-dom";

const MatchHistory = () =>{

    const [history, setHistory] = useState<{}[]>([]);
    const [user, setUser] = useState<{}[]>([]);
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const nick = searchParams.get('nick');

    useEffect(() => {
		const fetchData = async () =>{
			if (nick === null){
				const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/matchHistory`, {///
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				})
				const res = await response.json();
				if (response.ok)
				{
					setHistory(res.MatchHistory);
					setUser(res);
				}
			}
			else{
				const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/matchHistory/${nick}`, {///
					headers: {
						'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
					}
				})
				const res = await response.json();
				if (response.ok)
				{
					setHistory(res.MatchHistory);
					setUser(res);
				}
			}
		}
	fetchData();
	}, [])

	return(
		<div  className="matchHistory">
			<div className="matchHistoryBody">
				<div className="matchHistoryH">
					<h1>Match History</h1>
				</div>
				<div >
                {history.map((history, index) => (
                    <MatchHistoryList key={index} history={history} user={user}/>
                ))}
				</div>
			</div>
		</div>
	)
}

export default MatchHistory;
