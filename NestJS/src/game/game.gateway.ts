import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { clientInfo } from 'src/chat/entities/clientInfo.entity';
import { GameService } from 'src/game/game.service';
import { GameModeService } from 'src/game/game-mode.service';
import { connectedClients } from 'src/chat/chat.service';
import { disconnect } from 'process';

export let connectedGameSockets: clientInfo[] = [];
let queue: Socket[] = [];
let modeQueue: Socket[] = [];
let privGameQueue: {ids: number[], socket: Socket}[] = [];
let nextRoomID: number = 1;

@WebSocketGateway()
export class GameGateway {
	constructor(
		private gameService: GameService,
		private gameModeService: GameModeService
		){}

	@WebSocketServer()
	server: Server;

	handleDisconnect(client: Socket): void {
		this.gameService.leaveRoom(this.server, client);
		queue = queue.filter(cli => cli.id !== client.id);
		modeQueue = modeQueue.filter(cli => cli.id !== client.id);
		const theCli = connectedGameSockets.find(cli => cli.client.id === client.id);
		if ( theCli )
		{
			privGameQueue.forEach(e => {
				if ( e.socket.id === client.id)
				{
					//If the user leaving has some game invitations the user invited is need to be informed
					e.ids.forEach(async (idElem) => {
						if (idElem !== theCli.id)
						{
							await this.gameService.deleteInvitation(idElem, theCli.id);
							const theUser: clientInfo = connectedClients.find(cli => cli.id === idElem);
							if( theUser )
								theUser.client.emit("GameInvitation");
						}
					})
					privGameQueue = privGameQueue
				}
			})
		}
		privGameQueue = privGameQueue.filter(e => e.socket.id !== client.id);
		connectedGameSockets = connectedGameSockets.filter(cli => cli.client.id !== client.id);
	}

	@SubscribeMessage('joinGame')
	handleJoinGame(client: Socket, data: {id: number}) {
		if (!queue.includes(client)) {
			queue.push(client);
			connectedGameSockets.push({id: data.id, client: client});
			console.log(`Client ${client.id} joined the queue.`);
		}

		if (queue.length >= 2) {
			const player1 = queue.shift();
			const player2 = queue.shift();

			if (player1 && player2) {
				this.gameService.createRoom(this.server, nextRoomID.toString(), player1, player2);
				nextRoomID++;
			}
		} else {
			console.log('Waiting for more players to join.');
		}
	}

	@SubscribeMessage('stopInterval')
	handleStopInterval(client: Socket, roomID: string) {
		this.gameService.stopGame(roomID, false);
		client.disconnect();
	}
	
	@SubscribeMessage('stopIntervalDisconnect')
	handleStopIntervalDisconnect(client: Socket, roomID: string) {
		client.disconnect();
		this.gameService.stopGame(roomID, true);
	}

	@SubscribeMessage('joinModeGame')
	handleJoinModeGame(client: Socket, data: {id: number}) {
		if (!modeQueue.includes(client)) {
			modeQueue.push(client);
			connectedGameSockets.push({id: data.id, client: client});
			console.log(`Client ${client.id} joined the Mode queue.`);
		}

		if (modeQueue.length >= 2) {
			const player1 = modeQueue.shift();
			const player2 = modeQueue.shift();

			if (player1 && player2) {
				this.gameModeService.createRoom(this.server, nextRoomID.toString(), player1, player2)
				nextRoomID++;
			}
		} else {
			console.log('Waiting for more players to join.');
		}
	}

	@SubscribeMessage('stopModeInterval')
	handleStopModeInterval(client: Socket, roomID: string) {
		this.gameService.stopGame(roomID, false);
		client.disconnect();
	}

	@SubscribeMessage('joinPrivGame')
	handleJoinPrivGame(client: Socket, data: {myId: number, rivalID: number}) {
		connectedGameSockets.push({id: data.myId, client: client});
		const queueElement: {ids: number[], socket: Socket} = privGameQueue.find(element => ((element.ids.some(id => (id === data.myId)) && element.socket.id !== client.id)))
		if ( queueElement )
		{
			this.gameService.createRoom(this.server, nextRoomID.toString(), client, queueElement.socket);
			nextRoomID++;
			privGameQueue = privGameQueue.filter(element => element !== queueElement);
		}
		else {
			if (!privGameQueue.includes({ids: [data.myId, data.rivalID], socket: client}))
				privGameQueue.push({ids: [data.myId, data.rivalID], socket: client})
			console.log("User Id: ", data.myId, ` is waiting for his friend ${data.rivalID} to join.`);
		}
	}
	
	@SubscribeMessage('rejectPrivGame')
	handleRejectPrivGame(client: Socket, data: {myId: number, rivalID: number}) {
		const queueElement: {ids: number[], socket: Socket} = privGameQueue.find(element => ((element.ids.some(id => (id === data.myId)) && element.socket.id !== client.id)))
		if ( queueElement )
		{
			queueElement.socket.emit("InvitationRejected");
			privGameQueue = privGameQueue.filter(element => element !== queueElement);
		}
	}

	@SubscribeMessage('invite')
	handleInvite(client: Socket, data: {myId: number, rivalID: number}) {
		const rival: clientInfo = connectedClients.find(e => e.id === data.rivalID);
		if (rival) {
			rival.client.emit("GameInvitation");
		}
	}

	@SubscribeMessage('stopPrivInterval')
	handleStopPrivInterval(client: Socket, roomID: string) {
		this.gameService.stopGame(roomID, false);
		client.disconnect();
	}
	
	@SubscribeMessage('movePaddle')
	handleMovePaddle(client: Socket, obj: {rivalID: string, direction: string, location: string, roomID: string}) {
		this.gameService.changePaddleSpeed(this.server, client.id, obj)
	}

	@SubscribeMessage('stopPaddle')
	handleStopPaddle(client: Socket, obj: {rivalID: string, direction: string, location: string, roomID: string}) {
		this.gameService.stopPaddle(this.server, client.id, obj)
	}

	@SubscribeMessage('moveModePaddle')
	handleMoveModePaddle(client: Socket, obj: {rivalID: string, direction: string, location: string, roomID: string}) {
		this.gameModeService.changePaddleSpeed(this.server, client.id, obj)
	}

	@SubscribeMessage('stopModePaddle')
	handleStopModePaddle(client: Socket, obj: {rivalID: string, direction: string, location: string, roomID: string}) {
		this.gameModeService.stopPaddle(this.server, client.id, obj)
	}
}
