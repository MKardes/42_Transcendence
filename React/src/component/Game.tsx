import React, { useEffect, useState } from 'react';
import io from "socket.io-client";
import Canvas from './Canvas';
import { cookies } from "../App";
import CanvasMode from './CanvasMode';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../pages/Home';
import ok from "../images/ok.png";
import ko from "../images/close.png";

let rivalSocketID: string = "";
let rivalID: number;

export let socketGame = io(`https://${process.env.REACT_APP_IP}:80`, {
    transports: ['websocket']
});

const Game = ({user}) => {
    const uLocation = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(uLocation.search);
    const [state, setState] = useState(0);
    const [privGame, setPrivGame] = useState(0);
    const [rivalNick, setRivalNick] = useState<string>("");
    const [myNick, setMyNick] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [roomID, setRoomID] = useState<string>("");
    const [gameInvitations, setGameInvitations] = useState<any[]>([]);
    const [gameInvitationsFetched, setGameInvitationsFetched] = useState(false);

    const handleRemoveQueryParam = () => {
        const searchParams = new URLSearchParams(uLocation.search);
        searchParams.delete('id');
        const newSearchString = searchParams.toString();
        navigate({
            search: newSearchString,
        });
    };
    useEffect(() => {
        const fetchData = async () =>{
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/game/gameInvitations`, {///
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            const res = await response.json();
            setGameInvitations(res);
            setGameInvitationsFetched(true);
        }

        socket.on("GameInvitation", async () => {
            await fetchData();
        })

        if (!gameInvitationsFetched) {
            fetchData();
        }

        return () => {
            socket.off("GameInvitation");
        };
    }, [gameInvitationsFetched])
    
    useEffect(() => {
        let friendID = searchParams.get('id');
        const fetchData = async () =>{
            if (friendID !== null) {
                socketGame.disconnect();
                socketGame = io(`https://${process.env.REACT_APP_IP}:80`, {
                    transports: ['websocket']
                });
                socketGame.emit('joinPrivGame', {myId: user.id, rivalID: parseInt(friendID)});
                socketGame.emit('invite', {myId: user.id, rivalID: parseInt(friendID)});
                setPrivGame(1);
                await fetch(`https://${process.env.REACT_APP_IP}:80/game/invite/${friendID}`, {
                    headers: {
                        'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                    }
                })
                friendID = "Changed";
                handleRemoveQueryParam();
            }
        }
        fetchData();
    }, [searchParams]);

    useEffect(() => {
        socketGame.on("openGame", async (data) => {
            rivalID = data.rivalId;
            rivalSocketID = data.rival;
            setRoomID(data.roomID);
            setLocation(data.myLocation);
            setState(2);
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/nick/${rivalID}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            const res = await response.json();
            setRivalNick(res.nick);
            setMyNick(res.myNick);
        });
        
        socketGame.on("openModeGame", async (data) => {
            rivalID = data.rivalId;
            rivalSocketID = data.rival;
            setRoomID(data.roomID);
            setLocation(data.myLocation);
            setState(3);
            const response = await fetch(`https://${process.env.REACT_APP_IP}:80/user/nick/${rivalID}`, {
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
            const res = await response.json();
            setRivalNick(res.nick);
            setMyNick(res.myNick);
        });

        
        return(()=> {
            socketGame.off("openGame");
            socketGame.off("openModeGame");
            //socketGame.off("InvitationRejected");
        })   
    },[searchParams, state]);

    socketGame.on("InvitationRejected", () => {
        setState(0);
        setPrivGame(0);
    })    

    const handleKeyDown = (e: any) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (state === 2)
                socketGame.emit('movePaddle', {rivalID: rivalSocketID, direction: e.key, location: location, roomID: roomID});
                if (state === 3)
                socketGame.emit('moveModePaddle', {rivalID: rivalSocketID, direction: e.key, location: location, roomID: roomID});
        }
    };

    const handleKeyUp = (e: any) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (state === 2)
                socketGame.emit('stopPaddle', {rivalID: rivalSocketID, direction: e.key, location: location, roomID: roomID});
            if (state === 3)
                socketGame.emit('stopModePaddle', {rivalID: rivalSocketID, direction: e.key, location: location, roomID: roomID});
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyDown);
        };
    }, [roomID, location]);

    const handleClick = () => {
        socketGame.disconnect();
        socketGame = io(`https://${process.env.REACT_APP_IP}:80`, {
            transports: ['websocket']
        });
        socketGame.emit('joinGame', {id: user.id});
        setState(1);
    }
    
    const handleModeClick = () => {
        socketGame.disconnect();
        socketGame = io(`https://${process.env.REACT_APP_IP}:80`, {
            transports: ['websocket']
        });
        socketGame.emit('joinModeGame', {id: user.id});
        setState(1);
    }

    const acceptReq = (e: any) =>{
        const fetchData = async () =>{
            await fetch(`https://${process.env.REACT_APP_IP}:80/game/deleteInvitaton/${e.id}`, {///
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
        }
        socketGame.disconnect();
        socketGame = io(`https://${process.env.REACT_APP_IP}:80`, {
            transports: ['websocket']
        });
        // open game
        socketGame.emit('joinPrivGame', {myId: user.id, rivalID: e.inviterID});
        setState(2);
        fetchData();
    }
    
    const rejectReq = (e: any) =>{
        const fetchData = async () =>{
            await fetch(`https://${process.env.REACT_APP_IP}:80/game/deleteInvitaton/${e.id}`, {///
                headers: {
                    'authorization': 'Bearer ' + cookies.get("jwt_authorization"),
                }
            })
        }
        socketGame.emit('rejectPrivGame', {myId: user.id, rivalID: e.inviterID});
        fetchData();
    }

    return(
        <div className='oyun'>
        {
            privGame === 1 && state !== 2 ? (
                <div>
                    <p>Please wait your friend to accept invitation...</p>
                </div>
            ) : state === 0 ? (
            <div className='game'>
                <div className="gameLeft">
                    <div className="PlayButton" onClick={handleClick}>
                        PLAY
                    </div>
                    <div className="PlayModeButton" onClick={handleModeClick}>
                        PLAY MODE
                    </div>
                </div>
                <div className="gameRight">
                    {
                        privGame === 0  && (state === 0 || state === 1) ? (<>
                            <div className="gameRequest">
                                <span className="gameRequestH">
                                    Game Requests
                                </span>
                                <div className="gameRequestList">
                                    {gameInvitations.map((req) => (
                                        <div className="gameRequestLi" key={req.id}>
                                            <li className='nick'>{req.inviterNick}</li>
                                            <div>
                                                <img src={ok} alt="a" onClick={() => acceptReq(req)} />
                                                <img src={ko} alt="b" onClick={() => rejectReq(req)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>): null
                    }
                </div>
            </div>
            )
            : state === 1 ? (
                <div>
                    <p>You are in the queue</p>
                    <p>Please wait for another player...</p>
                </div> 
            )
            : state === 2 ?(
                <div>
                    <Canvas location={location} myNick={myNick} rival={{nick: rivalNick, id: rivalID}} roomID={roomID} setState={setState} setPrivGame={setPrivGame}/>
                </div>
            ) : state === 3 ? (
                <div>
                    <CanvasMode location={location} myNick={myNick} rival={{nick: rivalNick, id: rivalID}} roomID={roomID} setState={setState} setPrivGame={setPrivGame}/>
                </div>
            ) : null
        }
        </div>
    )
};

export default Game;
