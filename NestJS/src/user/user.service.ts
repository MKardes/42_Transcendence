import { Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/jwtconstants';
import { PrismaService } from 'src/prisma/prisma.service';
import { AvatarService } from 'src/avatar/avatar.service';
import { Socket } from 'socket.io';
import { connectedClients } from 'src/chat/chat.service';

@Injectable()
export class UserService
{
    constructor(
        private prisma: PrismaService,
        private avatarService: AvatarService,
        private jwtService: JwtService){}

    // undefined if couldn't verify the token or the header does not exist
    // {user}
    async getUserByJWT(header: string): Promise<any> {
        if(!header)
            return(undefined);
		const token = header.replace('Bearer ', '');
		try
		{
			const decode = this.jwtService.verify(token, jwtConstants);
			const userID: number = decode.sub;
			const user = await this.getUserByID(userID);
			return user;
		}
		catch(error)
		{
			return(undefined)
		}
    }

    async getUserByID(id: number, include?: any): Promise<any> {
        const user = await this.prisma.user.findFirst({
            where: {
                id: id
            },
            include: include
        });
        return user;
    }

    async getUserByLogin(login: string): Promise<any> {
        const user = await this.prisma.user.findFirst({
            where: {
                login: login
            },
        });
        return user;
    }

    async getUserByNick(nick: string, include?: any): Promise<any> {
        const user = await this.prisma.user.findFirst({
            where: {
                nick: nick,
            },
            include: include
        });
        if (!user)
            throw ("Error");
        return user;
    }

    async updateUserByID(userUpdateInformation: any, userID: number): Promise<number> {
        try
        {
            await this.prisma.user.update({
                where: { id: userID },
                data: userUpdateInformation,
            });
        }
        catch(error)
        {
            console.log("Couldn't be updated!!(" + userUpdateInformation + ")");
            return -1;
        }
        return 0;
    }

    async updateUser(userUpdateInformation: any, user: any): Promise<number> {
        try
        {
            await this.prisma.user.update({
                where: {
                    login: user.login
                },
                data: userUpdateInformation,
            });
        }
        catch(error)
        {
            console.log("Couldn't be updated!!(" + userUpdateInformation + ")");
            return -1;
        }
        return 0;
    }

    async createToken(userId: number): Promise<string> {
		const payload = {
			"sub": userId,
			"iat": 13334150876,
		};
		return this.jwtService.sign(payload, jwtConstants);
	}

    async getChannels(user: any, isDirect: boolean) : Promise<any> {
        const userCh = await this.prisma.user.findFirst({
            where: { id : user.id },
            select: {
                Channels: {
                    where: { IsDirect: isDirect },
                    include: { Users: true}
                }
            }
        })
        const channels = userCh.Channels;
        channels.forEach((element) => {
            element.Users = element.Users.filter((element) => element.id !== user.id)
        })
        let channelsWithImages: any[] = [];
        if (isDirect === true)
        {
            channels.forEach(async (element) => {
                let otherUser: any;
                element.Users.forEach((element) => {
                        if(element.id !== user.id)
                            otherUser = element;
                })
                channelsWithImages.push({...element, imgBuffer: this.avatarService.OpenImgFromUser(otherUser)});
            })
        }
        return (isDirect === true ? channelsWithImages : channels);
    }

    async changeNick(userId: number, nickToChange: string): Promise<string>
    {
		const user = await this.getUserByID(userId);
        if (nickToChange === "" || nickToChange === user.nick)
            return "Nick could not be changed!";
        if (await this.updateUser({nick: nickToChange}, user) === -1)
            return "Nick in use!!";
        return "Nick is changed successfully.";
    }

    async signForm(user: any): Promise<boolean>
    {
        const userCh = await this.prisma.user.findFirst({
            where: { id : user.id },
        })
        if (userCh.IsFormSigned === false)
        {
            await this.updateUser({IsFormSigned: true}, userCh)
            return true;
        }
        else
            return false;
    }

    async getFriendsSockets(userID: number): Promise<Socket[]>{
        const user = await this.prisma.user.findFirst({
            where: { id: userID },
            select:{ Friends: {
                include: { Users: true }
            }},
        })
        let friendsSockets: Socket[] = [];
        if ( user !== null && user.Friends !== null ){
            user.Friends.forEach((element) => { element.Users.forEach((e) => {
                if (e.id !== userID)
                {
                    const friendSocket = this.getSocketByUserID(e.id)
                    if(friendSocket !== undefined)
                        friendsSockets.push(friendSocket);
                };
            })});
        }
        return friendsSockets;
    }

    async setUserStatus(userID: number, status: string): Promise<void> {
        if (userID === 0)
            return;
        await this.updateUserByID({ Status: status }, userID);
        const friendSockets: Socket[] = await this.getFriendsSockets(userID);
        if (friendSockets){
            friendSockets.forEach((element) => {
                element.emit("Friend Status");
            })
        }
    }

    getSocketByUserID(userID: number): Socket | undefined
	{
		const clientInfo = connectedClients.find((clientInfo) => clientInfo.id === userID);
		if (clientInfo)
			return (clientInfo.client);
		return (undefined);
	}
}
