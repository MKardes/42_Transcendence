import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { clientInfo } from './entities/clientInfo.entity';

export let connectedClients: clientInfo[] = [];

@Injectable()
export class ChatService {
	constructor(
		private prisma: PrismaService,
	){}

	// data: {message: string, channelName: string, senderID: number, senderNick: string}
	async subscribeToChannel(data: any): Promise<void> {
		const channel = await this.prisma.channel.findFirst({
			where: {
				Name: data.channelName,
			},
			select: {
				Users: {
					select:{
						id: true,
						IgnoredUsers: true,
					}
				},
				MutedIDs: true,
			}
		});
		if(!channel)
		{
			console.log("The channel: " + data.channelName + " couldn't be found in the database!");
			return;
		}
		const usersOnChat = channel.Users;
		const MutedIDs = channel.MutedIDs;
		usersOnChat.forEach((element) => {
			const socket = this.getSocketByUserID(element.id);
			if(!socket)
				return;
			if (!element.IgnoredUsers.some((element) => element.OtherUserID === data.senderID) &&
				!MutedIDs.some((element) => element === data.senderID)
			)
				socket.emit('chat', {message: data.message, channelName: data.channelName, senderID: data.senderID, senderNick: data.senderNick});
		});
	}
	// data: {message: string, channelName: string, senderID: number, senderNick: string}
	async saveMessage(data: any): Promise<void> {

		const channel = await this.prisma.channel.findFirst({
			where: {
				Name: data.channelName
			},
			select: {
				Name: true,
				messages: true,
			}
		});
		if(!channel)
		{
			console.log("The channel: " + data.channelName + " couldn't be found in the database!");
			return;
		}
		await this.prisma.message.create({
			data: {
				message: data.message,
				channelName: channel.Name,
				senderID: data.senderID,
				senderNick: data.senderNick,
			}
		});
	}

	getUserBySocket(client: Socket): number
	{
		const clientInfo = connectedClients.find((clientInfo) => clientInfo.client === client);
		if (clientInfo)
			return (clientInfo.id);
		return (undefined);
	}

	getSocketByUserID(userID: number): Socket
	{
		const clientInfo = connectedClients.find((clientInfo) => clientInfo.id === userID);
		if (clientInfo)
			return (clientInfo.client);
		return (undefined);
	}

	removeClient(clientID: string)
	{
		connectedClients = connectedClients.filter(cli => cli.client.id !== clientID);
	}
}
