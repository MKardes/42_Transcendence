import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { connectedGameSockets } from 'src/game/game.gateway';
import { UserService } from 'src/user/user.service';
import { gameIntervals } from './game.service';

let roomStatesM: Map<string, {
    leftPaddleY: number,
    rightPaddleY: number,
    leftPaddleHeight: number,
    rightPaddleHeight: number,
    ballX: number,
    ballY: number,
    speedX: number,
    speedY: number,
    leftPaddleM: number,
    rightPaddleM: number }> = new Map();
let paddleSpeedM: number = 10;

@Injectable()
export class GameModeService {
    constructor( private userService: UserService ){}

    async createRoom(server: Server, roomId: string, socket1: Socket, socket2: Socket) {
        const user1ID = this.getUserBySocket(socket1);
        const user2ID = this.getUserBySocket(socket2);
        await this.userService.setUserStatus(user1ID, "In-Game");
        await this.userService.setUserStatus(user2ID, "In-Game");
        let randY: number = Math.round(Math.random() * 10) - 5;
        let randX = Math.round(Math.random() * 12) - 6;
        randX = randX <= 4 && randX >= 0 ? 5 : randX < 0 && randX >= -4 ? -5 : randX;
        roomStatesM.set(roomId, {
            leftPaddleY: 225,
            rightPaddleY: 225,
            leftPaddleHeight: 120,
            rightPaddleHeight: 120,
            ballX: 395,
            ballY: 295,
            speedX: randX,
            speedY: randY,
            leftPaddleM: 0,
            rightPaddleM: 0});
        socket1.join(roomId);
        socket2.join(roomId);
        socket1.emit('openModeGame', {rival: socket2.id, myLocation: "left", roomID: roomId, rivalId: user2ID});
        socket2.emit('openModeGame', {rival: socket1.id, myLocation: "right", roomID: roomId, rivalId: user1ID});
        this.startGameLoop(server, roomId);
    }

    startGameLoop(server: Server, roomId: string) {
		let intervalID = setInterval(() => {
            let gameState = roomStatesM.get(roomId);
            if (gameState) {
                if (gameState.ballX + 20 + gameState.speedX >= 780)
                {
                    //soldaki atti
                    server.to(roomId).emit('scoreModeUpdate', "left");
                    gameState.ballX = 395;
                    gameState.ballY = 295;
                    let rand: number = Math.round(Math.random() * 10) - 5;
                    gameState.speedY = rand;
                    rand = Math.round(Math.random() * 12) - 6;
                    rand = rand <= 4 && rand >= 0 ? 5 : rand < 0 && rand >= -4 ? -5 : rand;
                    gameState.speedX = rand;
                    if (gameState.rightPaddleHeight > 40)
                        gameState.rightPaddleHeight -= 20;
                }
                if (gameState.ballX + gameState.speedX <= 10)
                {
                    //sağdaki atti
                    server.to(roomId).emit('scoreModeUpdate',  "right");
                    gameState.ballX = 395;
                    gameState.ballY = 295;
                    let rand: number = Math.round(Math.random() * 10) - 5;
                    gameState.speedY = rand;
                    rand = Math.round(Math.random() * 14) - 7;
                    rand = rand <= 5 && rand >= 0 ? 6 : rand < 0 && rand >= -5 ? -6 : rand;
                    gameState.speedX = rand;
                    if (gameState.leftPaddleHeight > 40)
                        gameState.leftPaddleHeight -= 20;
                }
                if (gameState.ballY + 20 + gameState.speedY >= 580 || gameState.ballY + gameState.speedY <= 10 )
                    gameState.speedY = -gameState.speedY;
                gameState = this.paddleCollision(gameState);
                gameState.ballX += gameState.speedX;
                gameState.ballY += gameState.speedY;
                gameState = this.movePaddle(gameState);
                server.to(roomId).emit('updateModeGameState', gameState);
            }
        }, 16 ); // 60 FPS
        gameIntervals.set(roomId, intervalID);
	}

    paddleCollision(e: any): any{
        if (e.ballX >= 30 && e.ballX <= 30 + 15 && e.ballY >= e.leftPaddleY - 20 && e.ballY <= e.leftPaddleY + e.leftPaddleHeight)
        {
            // if the ball is left side and collide with paddle
            const devisor: number = Math.round(((e.leftPaddleHeight + 20) / 2) / 10);
            if(e.ballY >= e.leftPaddleY - 20 && e.ballY < e.leftPaddleY + (e.leftPaddleHeight + 20) / 2)
            {
                //top half of paddle
                e.speedY = -(((e.ballY - (e.leftPaddleY - 20)) / devisor) + 1);
                e.speedX = (10 - Math.abs(e.speedY));
            }
            if(e.ballY >= e.leftPaddleY + (e.leftPaddleHeight + 20) / 2 && e.ballY < e.leftPaddleY + e.leftPaddleHeight)
            {
                //bottom half of paddle
                e.speedY = (((e.ballY - (e.leftPaddleY + (e.leftPaddleHeight + 20) / 2)) / devisor) + 1);
                e.speedX = (10 - Math.abs(e.speedY));
            }
            if(e.speedY >= 0 && e.speedY < 1)
            {
                e.speedY = 2;
                e.speedX = 8;
            }
            if(e.speedY <= 0 && e.speedY > -1)
            {
                e.speedY = -2;
                e.speedX = 8;
            }
            if((e.speedX >= 0 && e.speedX < 1) || e.speedX < 0)
            {
                e.speedY = 8;
                e.speedX = 2;
            }
        }
        if (e.ballX >= 755 - 10 && e.ballX <= 755 + 5 && e.ballY >= e.rightPaddleY - 20 && e.ballY <= e.rightPaddleY + e.rightPaddleHeight)
        {
            // if the ball is right side and collide with paddle
            const devisor: number = Math.round(((e.leftPaddleHeight + 20) / 2) / 10);
            if(e.ballY >= e.rightPaddleY - 20 && e.ballY < e.rightPaddleY + (e.rightPaddleHeight + 20) / 2)
            {
                //top half of paddle
                e.speedY = -(((e.ballY - (e.rightPaddleY - 20)) / devisor) + 1);
                e.speedX = -(10 - Math.abs(e.speedY));
            }
            if(e.ballY >= e.rightPaddleY + (e.rightPaddleHeight + 20) / 2 && e.ballY < e.rightPaddleY + e.rightPaddleHeight)
            {
                //bottom half of paddle
                e.speedY = (((e.ballY - (e.rightPaddleY + (e.rightPaddleHeight + 20) / 2)) / devisor) + 1);
                e.speedX = -(10 -  Math.abs(e.speedY));
            }
            if(e.speedY >= 0 && e.speedY < 1)
            {
                e.speedY = 2;
                e.speedX = -8;
            }
            if(e.speedY <= 0 && e.speedY > -1)
            {
                e.speedY = -2;
                e.speedX = -8;
            }
            if((e.speedX <= 0 && e.speedX > -1) || e.speedX > 0)
            {
                e.speedY = 8;
                e.speedX = -2;
            }
        }
        return e
    }

    movePaddle(gameState: any){
        if (gameState.leftPaddleY + gameState.leftPaddleM > 15 && gameState.leftPaddleY + gameState.leftPaddleM <= 600 - (gameState.leftPaddleHeight) - 15 )
            gameState.leftPaddleY = gameState.leftPaddleY + gameState.leftPaddleM;
        if (gameState.rightPaddleY + gameState.rightPaddleM > 15 && gameState.rightPaddleY + gameState.rightPaddleM <= 600 - (gameState.rightPaddleHeight) - 15 )
            gameState.rightPaddleY = gameState.rightPaddleY + gameState.rightPaddleM;
        return gameState;
    }

    changePaddleSpeed(server: Server, clientID: string, obj: {rivalID: string, direction: string, location: string, roomID: string}): void {
        let gameStates: any = roomStatesM.get(obj.roomID);
        const stick: number = this.findStick(clientID, obj.rivalID, obj.location);
        gameStates = this.changeSpeed(obj.direction, stick, gameStates, paddleSpeedM)
        roomStatesM.set(obj.roomID, gameStates);
    }

    stopPaddle(server: Server, clientID: string, obj: {rivalID: string, direction: string, location: string, roomID: string}): void {
        let gameStates: any = roomStatesM.get(obj.roomID);
        const stick: number = this.findStick(clientID, obj.rivalID, obj.location);
        gameStates = this.changeSpeed(obj.direction, stick, gameStates, 0)
        roomStatesM.set(obj.roomID, gameStates);
    }

    changeSpeed(direction: string, stick: number, gameStates: any, speedF: number): any {
        if(direction == "ArrowUp")
		{
			// up movement
			if (stick === 0)
                gameStates.leftPaddleM = -speedF;
			else
                gameStates.rightPaddleM = -speedF;
        }
        else
        {
            // down movement
            if (stick === 0)
                gameStates.leftPaddleM = speedF;
            else
                gameStates.rightPaddleM = speedF;
        }
        return gameStates;
    }

	findStick(player: string, rivalSocket: string, location: string): number {
		let res: number = 0;
		if(rivalSocket === player)
		{
			if(location === "left")
				res = 1
		}
		else if(location === "right")
			res = 1;
		return res;
	}

    getUserBySocket(client: Socket): number
	{
		const clientInfo = connectedGameSockets.find((clientInfo) => clientInfo.client === client);
		if (clientInfo)
			return (clientInfo.id);
		return (undefined);
	}
}
