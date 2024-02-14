import { Controller, Get, UseGuards, Res, Param, Req, ParseBoolPipe} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtGuard } from 'src/auth/strategies/jwt/jwt.guard';
import { ChatChannelService } from './chat-channel.service';
import { ChatService, connectedClients } from './chat.service';

@Controller('chat/:channelName')
export class ChatChannelController {
    constructor(
            private chatChannelService: ChatChannelService,
            private prisma: PrismaService,
            private userService: UserService,
    ){}

    @Get()
    @UseGuards(JwtGuard)
    async getChannel(
        @Res() res: Response,
        @Req() req: Request,
        @Param('channelName') chname: string){
        const userID: number = parseInt(req.body.toString(), 10);
        return res.send({myid: userID, channel: await this.chatChannelService.getChannel(userID, chname)});
    }

    @Get('/leave')
    @UseGuards(JwtGuard)
    async getLeave(
        @Res() res: Response,
        @Req() req: Request,
        @Param('channelName') chname: string
    )
    {
        try{
            const userID: number = parseInt(req.body.toString(), 10);
            return res.send(await this.chatChannelService.leaveChannel(chname, userID));
        }
        catch(error){
            return res.status(580).json({error: error});
        }
    }

    @Get('/users')
    @UseGuards(JwtGuard)
    async getUsersInChannel(
        @Res() res: Response,
        @Req() req: Request,
        @Param('channelName') chname: string)
    {
        const userID: number = parseInt(req.body.toString(), 10);
        return res.send(await this.chatChannelService.getUsersInCh(chname, userID));
    }

    @Get('/messages')
    @UseGuards(JwtGuard)
    async getMessages(
        @Res() response: Response,
        @Req() req: Request,
        @Param('channelName') chname: string)
    {
        const userID: number = parseInt(req.body.toString(), 10);
        const include = { IgnoredUsers: true};
        const user = await this.userService.getUserByID(userID, include);
        //Lets find Channel
        const channel = await this.prisma.channel.findFirst({
            where: {
                Name: chname,
            },
            select: {
                messages: true,//order
                Users: {
                    where: {
                        id: userID
                    },
                    select: {
                        id: true,
                        IgnoredUsers: true,
                    }
                },
                BannedIDs: true,
                MutedIDs: true,
            }
        });
        if (channel === null)
            return response.send({msg: "The channel to see messages is not be founded!"});
        let messages = channel.messages;

        messages = messages.filter(
            message => !(
                channel.MutedIDs.some((element) => element === message.senderID) ||
                channel.BannedIDs.some((element) => element === message.senderID) ||
                user.IgnoredUsers.some((element) => element.OtherUserID === message.senderID)
                    )
                )
        return response.send(messages);
    }

    @Get('/setAdmin/:user')
    @UseGuards(JwtGuard)
    async getNewAdmin(
        @Req() req: Request,
        @Res() res: Response,
        @Param('user') destUser: string,
        @Param('channelName') chname:string)
    {
        const userID: number = parseInt(req.body.toString(), 10);
        try{
            return res.send({msg: await this.chatChannelService.channelOp(userID, chname, destUser, "setadmin")});
        }catch(error){
            return res.status(580).json({error: error}) }
    }

    @Get('/kick/:user')
    @UseGuards(JwtGuard)
    async getKickedUser(
        @Req() req: Request,
        @Res() res: Response,
        @Param('user') destUser: string,
        @Param('channelName') chname: string)
    {
        const userID: number = parseInt(req.body.toString(), 10);
        try{
            return res.send({msg: await this.chatChannelService.channelOp(userID, chname, destUser, "kick")});
        }catch(error){
            return res.status(580).json({error: error});
        }

    }

    @Get('/mute/:user')
    @UseGuards(JwtGuard)
    async getMutedUser(
        @Req() req: Request,
        @Res() res: Response,
        @Param('user') destUser: string,
        @Param('channelName') chname : string)
    {
        const userID: number = parseInt(req.body.toString(), 10);
        try{
            return res.send({msg: await this.chatChannelService.channelOp(userID, chname, destUser, "mute")});
        }catch(error){
            return res.status(580).json({error: error});
        }
    }

    @Get('/ban/:user')
    @UseGuards(JwtGuard)
    async getBannedUser(
        @Req() req: Request,
        @Res() res: Response,
        @Param('user') destUser: string,
        @Param('channelName') chname:string)
    {
        const userID: number = parseInt(req.body.toString(), 10);
        try{
            return res.send({msg: await this.chatChannelService.channelOp(userID, chname, destUser, "ban")});
        }catch(error){
            return res.status(580).json({error: error});
        }
    }

    @Get('/inviteChannel/:user')
    @UseGuards(JwtGuard)
    async InviteUserToChannel(
        @Req() req: Request,
        @Res() res: Response,
        @Param('user') destUser: string,
        @Param('channelName') chname: string
    ){
        const userID: number = parseInt(req.body.toString(), 10);
        return res.send(await this.chatChannelService.channelOp(userID, chname, destUser, "inviteCh"));
    }

    // IMPORTANT: When we request to this part of the chat fill the :isDirect and :isInviteOnly (do not make request with undefined except for passwd part)
    @Get('/create/:isDirect/:isInviteOnly/:passwd')
    @UseGuards(JwtGuard)
    async createChannel(
        @Req() req: Request,
        @Res() res: Response,
        @Param('channelName') chname: string,
        @Param('isDirect', new ParseBoolPipe()) isDirect : boolean,
        @Param('isInviteOnly', new ParseBoolPipe()) isInviteOnly : boolean,
        @Param('passwd') passwd: string
    ){
        // if (chname.is)
        const userID: number = parseInt(req.body.toString(), 10);
        const ch =  await this.chatChannelService.createCh(userID, chname, passwd, isDirect, isInviteOnly);
        return res.send(ch);
        // return res.send({res: await this.chatChannelService.createCh(userID, chname, passwd, isDirect, isInviteOnly)});
    }

    //CHANNEL PASSWORD OP.

    @Get('/setChannelPassword/:password')
    @UseGuards(JwtGuard)
    async setChannelPassword(
        @Req() req: Request,
        @Res() res: Response,
        @Param('channelName') chname: string,
        @Param('password') password: string
    ){
        const userID: number = parseInt(req.body.toString(), 10);
        return res.send({res: await this.chatChannelService.channelPasswordOp(userID, chname, "set", password)});
    }

    @Get('/changeChannelPassword/:password')
    @UseGuards(JwtGuard)
    async changeChannelPassword(
        @Req() req: Request,
        @Res() res: Response,
        @Param('channelName') chname: string,
        @Param('password') password: string
    ){
        const userID: number = parseInt(req.body.toString(), 10);
        return res.send({res: await this.chatChannelService.channelPasswordOp(userID, chname, "change", password)});
    }

    @Get('/removeChannelPassword')
    @UseGuards(JwtGuard)
    async removeChannelPassword(
        @Req() req: Request,
        @Res() res: Response,
        @Param('channelName') chname: string,
    ){
        const userID: number = parseInt(req.body.toString(), 10);
        return res.send({res: await this.chatChannelService.channelPasswordOp(userID, chname, "remove")});
    }
}

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService,
        private userService: UserService){}

    @Get('isConnected')
    @UseGuards(JwtGuard)
    async isBoundSocket(@Req() req: Request, @Res() res: Response): Promise<Response>
    {
        const userID: number = parseInt(req.body.toString(), 10);
        if (this.chatService.getSocketByUserID(userID) === undefined)
            return (res.send({res: 0, msg: "There is no socket with this ID. It is available to bind!"}));
        return (res.status(219).json({res: 1, msg: "There is a socket with this ID. It is not available to bind!"}));

    }

    @Get('connect')
    @UseGuards(JwtGuard)
    async bindSocket(@Req() req: Request): Promise<void>
    {
        const userID: number = parseInt(req.body.toString(), 10);
        const socketID: string = req.headers['socket-id'];
        if(!socketID || !userID)
        {
            console.log("SocketID or UserID couldn't find!");
            return;
        }
        const indexToUpdate = connectedClients.findIndex((clientInfo) => clientInfo.client.id === socketID);

        if (indexToUpdate === -1) {
            console.log("Client id couldn't be bind with userID!");
            return;
        }
        console.log("UserID: " + userID +" binded with socket " + socketID);
        connectedClients[indexToUpdate].id = userID;
        await this.userService.setUserStatus(userID, "Online");
    }
}
