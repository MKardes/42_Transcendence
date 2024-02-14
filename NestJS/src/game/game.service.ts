import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { clientInfo } from 'src/chat/entities/clientInfo.entity';
import { connectedGameSockets } from 'src/game/game.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

export let gameIntervals: Map<string, NodeJS.Timeout> = new Map<string, NodeJS.Timeout>();
let roomStates: Map<string, { leftPaddleY: number, rightPaddleY: number, ballX: number, ballY: number, speedX: number, speedY: number, leftPaddleM: number, rightPaddleM: number }> = new Map();
let endedGames: number[] = [];
let paddleSpeed: number = 10;

@Injectable()
export class GameService {
    constructor( private userService: UserService, private prisma: PrismaService){}

    async leaveRoom(server: Server, client: Socket): Promise<number>
    {
        const userID = this.getUserBySocket(client);
        if (userID === undefined)
            return;
        await this.userService.setUserStatus(userID, "Online");
        const adapter = server.of('/').adapter;
        let rooms: Map<string, string[]> = new Map();
		adapter.sids.forEach((value, key) => {
            const arr: any[] = Array.from(value);
            if(arr.length === 2)
            {
                if (rooms.has(arr[1]) === false)
                    rooms.set(arr[1], ["1", arr[0]]);
                else
                    rooms.set(arr[1], ["2", arr[0]]);
            }
        });
        rooms.forEach((value, key) => {
            if(endedGames.includes(parseInt(key)))
                return;
            if(value[0] === "1")
            {
                // value[1] won game because his rival disconnected
                const clientInf: clientInfo = connectedGameSockets.find(element => element.client.id === value[1]);
                const socket: Socket = clientInf.client;
                if (socket)
                {
                    socket.emit("scoreUpdate", "rivalDisconnected");
                    socket.emit("scoreModeUpdate", "rivalDisconnected");
                    socket.disconnect();
                }
            }
        })
        return;
    }

    async createRoom(server: Server, roomId: string, socket1: Socket, socket2: Socket) {
        const user1ID = this.getUserBySocket(socket1);
        const user2ID = this.getUserBySocket(socket2);
        await this.userService.setUserStatus(user1ID, "In-Game");
        await this.userService.setUserStatus(user2ID, "In-Game");
        roomStates.set(roomId, { leftPaddleY: 245, rightPaddleY: 245, ballX: 395, ballY: 295, speedX: 5, speedY: 5, leftPaddleM: 0, rightPaddleM: 0});
        socket1.join(roomId);
        socket2.join(roomId);
        socket1.emit('openGame', {rival: socket2.id, myLocation: "left", roomID: roomId, rivalId: user2ID});
        socket2.emit('openGame', {rival: socket1.id, myLocation: "right", roomID: roomId, rivalId: user1ID});
        this.startGameLoop(server, roomId);
    }

    stopGame(roomId: string, isDisconnect: boolean) {
        if (isDisconnect === false)
            endedGames.push(parseInt(roomId));
        const intervalId = gameIntervals.get(roomId);
        if (intervalId) {
            clearInterval(intervalId);
            gameIntervals.delete(roomId);
        }
    }

    startGameLoop(server: Server, roomId: string) {
		let intervalID = setInterval(() => {
            let gameState = roomStates.get(roomId);
            if (gameState) {
                if (gameState.ballX + 20 + gameState.speedX >= 780)
                {
                    //soldaki atti
                    server.to(roomId).emit('scoreUpdate', "left");
                    gameState.ballX = 395;
                    gameState.ballY = 295;
                    let rand: number = Math.round(Math.random() * 10) - 5;
                    gameState.speedY = rand;
                    rand = Math.round(Math.random() * 14) - 7;
                    rand = rand <= 5 && rand >= 0 ? 6 : rand < 0 && rand >= -5 ? -6 : rand;
                    gameState.speedX = rand;
                }
                if (gameState.ballX + gameState.speedX <= 10)
                {
                    //sağdaki atti
                    server.to(roomId).emit('scoreUpdate',  "right");
                    gameState.ballX = 395;
                    gameState.ballY = 295;
                    let rand: number = Math.round(Math.random() * 10) - 5;
                    gameState.speedY = rand;
                    rand = Math.round(Math.random() * 14) - 7;
                    rand = rand <= 5 && rand >= 0 ? 6 : rand < 0 && rand >= -5 ? -6 : rand;
                    gameState.speedX = rand;
                }
                if (gameState.ballY + 20 + gameState.speedY >= 580 || gameState.ballY + gameState.speedY <= 10 )
                    gameState.speedY = -gameState.speedY;
                gameState = this.paddleCollision(gameState);
                gameState.ballX += gameState.speedX;
                gameState.ballY += gameState.speedY;
                gameState = this.movePaddle(gameState);
                server.to(roomId).emit('updateGameState', gameState);
            }
        }, 16 ); // 60 FPS
        gameIntervals.set(roomId, intervalID);
	}

    paddleCollision(e: any): any{
        if (e.ballX >= 30 && e.ballX <= 30 + 15 && e.ballY >= e.leftPaddleY - 20 && e.ballY <= e.leftPaddleY + 80)
        {
            if(e.ballY >= e.leftPaddleY - 20 && e.ballY < e.leftPaddleY + 30)
            {
                //üst parça 45 fark
                e.speedY = -(((e.ballY - (e.leftPaddleY - 20)) / 5) + 1);
                e.speedX = (10 - (((e.ballY - (e.leftPaddleY - 20)) / 5) + 1));
            }
            if(e.ballY >= e.leftPaddleY + 30 && e.ballY < e.leftPaddleY + 80)
            {
                //alt parça
                e.speedY = (((e.ballY - (e.leftPaddleY + 30)) / 5) + 1);
                e.speedX = (10 - (((e.ballY - (e.leftPaddleY + 30)) / 5) + 1));
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
        if (e.ballX >= 755 - 10 && e.ballX <= 755 + 5 && e.ballY >= e.rightPaddleY - 20 && e.ballY <= e.rightPaddleY + 80)
        {
            if(e.ballY >= e.rightPaddleY - 20 && e.ballY < e.rightPaddleY + 30)
            {
                //üst parça 45 fark
                e.speedY = -(((e.ballY - (e.rightPaddleY - 10)) / 5) + 1);
                e.speedX = -(10 - (((e.ballY - (e.rightPaddleY - 10)) / 5) + 1));
            }
            if(e.ballY >= e.rightPaddleY + 30 && e.ballY < e.rightPaddleY + 80)
            {
                //alt parça
                e.speedY = (((e.ballY - (e.rightPaddleY + 30)) / 5) + 1);
                e.speedX = -(10 - (((e.ballY - (e.rightPaddleY + 30)) / 5) + 1));
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
        if (gameState.leftPaddleY + gameState.leftPaddleM > 15 && gameState.leftPaddleY + gameState.leftPaddleM <= 600 - (80)/*paddleHeight*/ - 15 )
            gameState.leftPaddleY = gameState.leftPaddleY + gameState.leftPaddleM;
        if (gameState.rightPaddleY + gameState.rightPaddleM > 15 && gameState.rightPaddleY + gameState.rightPaddleM <= 600 - (80)/*paddleHeight*/ - 15 )
            gameState.rightPaddleY = gameState.rightPaddleY + gameState.rightPaddleM;
        return gameState;
    }

    changePaddleSpeed(server: Server, clientID: string, obj: {rivalID: string, direction: string, location: string, roomID: string}): void {
        let gameStates: any = roomStates.get(obj.roomID);
        const stick: number = this.findStick(clientID, obj.rivalID, obj.location);
        gameStates = this.changeSpeed(obj.direction, stick, gameStates, paddleSpeed)
        roomStates.set(obj.roomID, gameStates);
    }

    stopPaddle(server: Server, clientID: string, obj: {rivalID: string, direction: string, location: string, roomID: string}): void {
        let gameStates: any = roomStates.get(obj.roomID);
        const stick: number = this.findStick(clientID, obj.rivalID, obj.location);
        gameStates = this.changeSpeed(obj.direction, stick, gameStates, 0)
        roomStates.set(obj.roomID, gameStates);
    }

    changeSpeed(direction: string, stick: number, gameStates: any, speedF: number): any {
        if(direction == "ArrowUp")
		{
			// up movement
			if (stick === 0)
			{
				if (gameStates.leftPaddleY >= 15 + 15)
                    gameStates.leftPaddleM = -speedF;
            }
			else
			{
                if (gameStates.rightPaddleY >= 15 + 15)
                    gameStates.rightPaddleM = -speedF;
            }
        }
        else
        {
            // down movement
            if (stick === 0)
            {
                //leftY = gameStates.leftPaddleY;
                if (gameStates.leftPaddleY <= 600 - (80)/*paddleHeight*/ - 15 - 10 - 10)// Canvas Height
                    gameStates.leftPaddleM = speedF;
            }
            else
            {
                if (gameStates.rightPaddleY <= 600 - (80)/*paddleHeight*/ - 15 - 10 - 10)// Canvas Height
                    gameStates.rightPaddleM = speedF;
            }
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

    async deleteInvitation(userID: number, inviterID: number){
        console.log(`userID: ${userID}, inviterID: ${inviterID}`);
        await this.prisma.gameInvitation.deleteMany({
			where: {
				AND: [
					{ UserID:  userID },
					{ inviterID: inviterID },
				],
			},
		})
    }
}

