import React from "react";

const MatchHistoryList = ({history, user}) =>{

	return(
		<div className="mtchContainer">
				<div className="matchResult">
					{
						history.Score > history.RivalScore ? (
							<span className="mtchWin">
								WIN
							</span>
						):(
							<span className="mtchLose">
								LOSE
							</span>
						)
					}
				</div>
				<div className="matchHistoryLeft">
					<div>
						<div className="nick">
							{user.nick}
							<div className="matchLetter">
								{history.Latter}
							</div>
							<div className="mtchScore">
								{history.Score}
							</div>
						</div>
					</div>
				</div>
				<div className="matchHistoryRight">
					<div>
						<div className="nick">
							{history.RivalNick}
							<div className="matchLetter">
								{history.RivalLatter}
							</div>
							<div className="mtchScore">
								{history.RivalScore}
							</div>
						</div>
					</div>
				</div>
		</div>
	)
}

export default MatchHistoryList;
