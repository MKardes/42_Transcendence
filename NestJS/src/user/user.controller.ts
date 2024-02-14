import { Controller, Get, Post , Body, Res, UseGuards, Req, Param, Headers, ParseIntPipe} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { JwtGuard } from 'src/auth/strategies/jwt/jwt.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { jwtConstants } from 'src/jwtconstants';
import { JwtService } from '@nestjs/jwt';
import { AvatarService } from 'src/avatar/avatar.service';

@Controller('user')
export class UserController {
	constructor(
		private jwtService: JwtService,
		private avatarService: AvatarService,
		private userService: UserService,
		private prisma: PrismaService){}

	@Get()
	@UseGuards(JwtGuard)
	async GetUser(@Req() req: Request): Promise<any>{
		const userID: number = parseInt(req.body.toString(), 10);
		return await this.userService.getUserByID(userID);
	}

	@Get('nick/:id')
	@UseGuards(JwtGuard)
	async GetUserNick(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', new ParseIntPipe()) id: number): Promise<any>{
		const userID: number = parseInt(req.body.toString(), 10);
		const me = await this.userService.getUserByID(userID)
		const rival = await this.userService.getUserByID(id);
		return res.send({myNick: me.nick, nick: rival.nick});
	}

	@Get('checkJWT')
	async CheckJWT(@Res() res: any, @Headers("authorization") jwt: string): Promise<any>{
		const token = jwt.replace('Bearer ', '');
		let user: any;
		try
		{
			const decode = this.jwtService.verify(token, jwtConstants);
			const userID = decode['sub'];
			user = await this.userService.getUserByID(userID);
		}
		catch(error) { return res.send(false); }
		if (user === null)
			return res.send(false);
		return res.send(user);
	}

	@Get('profile')
	@UseGuards(JwtGuard)
	async getUserProfile(@Res() response : Response, @Req() req : Request){
		const userID = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID, { Achievements: true });
		const retUser = { ...user, imgBuffer: this.avatarService.OpenImgFromUser(user)};
		return response.send(retUser);
	}

	@Get('profile/:nick')
	@UseGuards(JwtGuard)
	async getOtherProfile(@Res() response : Response, @Req() req : Request, @Param('nick') nick: string){
		let user:any;
		try { user = await this.userService.getUserByNick(nick, { Achievements: true }) }
		catch(error) { return response.status(580).json({msg: "The user couldn't be found!"})}
		const retUser = { ...user, imgBuffer: this.avatarService.OpenImgFromUser(user)};
		return response.send(retUser);
	}

	@Get('isSigned')
	@UseGuards(JwtGuard)
	async IsSignedForm(
		@Res() res: any,
		@Req() req: Request)
	{
		const userID = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID)
		if (user && user.IsFormSigned === true)
			return res.send(true);
		return res.send(false);
	}

	@Get('sign')
	@UseGuards(JwtGuard)
	async SignForm(
		@Req() req: Request,)
	{
		const userID = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID)
		await this.userService.signForm(user);
	}

	@Post('form')
    async postForm(
        @Res() res: any,
        @Body() body: any,
        @Headers('authorization') JWT: string,
    ) {
        //JWT CONTROL
        let userID: number;
        try{
            const token = JWT.replace('Bearer ', '');
            const decode = this.jwtService.verify(token, jwtConstants);
            userID = parseInt(decode.sub, 10);
        }
        catch(error)
        {
            console.log("Incorrect token!!");
            return ;
        }
        try
        {
            const file = body.file;
            const ret: { nick: string, image: string } = { nick: "", image: "" };
            ret.nick = await this.userService.changeNick(userID, body.nick);
            ret.image = await this.avatarService.changeAvatar(file, userID);
            return res.send(ret);
        }
        catch(error){
            return res.status(580).json({error: error});
        }
    }

	@Post('changeAvatar')
    async changeAvatar(
        @Res() res: any,
        @Body() body: any,
        @Headers('authorization') JWT: string,
    ) {
        //JWT CONTROL
        let userID: number;
        try{
            const token = JWT.replace('Bearer ', '');
            const decode = this.jwtService.verify(token, jwtConstants);
            userID = parseInt(decode.sub, 10);
        }
        catch(error)
        {
            console.log("Incorrect token!!");
            return ;
        }
        try
        {
            const file = body.file;
            return res.send({msg: await this.avatarService.changeAvatar(file, userID)});
        }
        catch(error){
            return res.status(580).json({error: error});
        }
    }

    @Get('changeNick/:nickToChange')
    @UseGuards(JwtGuard)
    async ChangeNick(
        @Req() req: Request,
        @Res() res: Response,
        @Param('nickToChange') nickToChange: string): Promise<object>
    {
        try{
            const userID = parseInt(req.body.toString(), 10)
            return res.send({msg: await this.userService.changeNick(userID, nickToChange)});
        }catch(error) {
            return res.status(580).json({msg: "Database Error"});
        }
    }

	@Get('ignoreUser/:user')
	@UseGuards(JwtGuard)
	async IgnoreUser(
		@Req() req: Request,
		@Res() res: Response,
		@Param('user') destuser: string)
	{
		const userID: number = parseInt(req.body.toString(), 10);
		let user = await this.userService.getUserByID(userID);
		user = await this.userService.getUserByNick(user.nick, {IgnoredUsers: true});
		const destUser = await this.userService.getUserByNick(destuser);
		await this.prisma.ignore.create({
			data: {
				OtherUserID: destUser.id,
				UserId: user.id
			}
		})
		await this.prisma.friend.deleteMany({
			where: {
				AND: [
					{ Users: { some: { id: userID } } },
					{ Users: { some: { id: destUser.id } } },
				],
			},
		});
		return res.send('The user has been ignored.');
	}

	@Get('channels')
	@UseGuards(JwtGuard)
	async GetChannels(
		@Req() req: Request,
		@Res() res: Response)
		{
			const userID: number = parseInt(req.body.toString(), 10);
			const user = await this.userService.getUserByID(userID);
			const channels = await this.userService.getChannels(user, false);
			return res.send(channels);
		}

	@Get('privChannels')
	@UseGuards(JwtGuard)
	async GetPrivChannels(
		@Req() req: Request,
		@Res() res: Response){
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID);
		const channels = await this.userService.getChannels(user, true);
		return res.send(channels);
	}

	@Get('friends')///
	@UseGuards(JwtGuard)
	async GetFriends(
		@Req() req: Request,
		@Res() res: Response)
	{
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.prisma.user.findFirst({
			where: { id : userID},
			select : {
				id: true,
				Friends: {
					include: {
						Users: true
					}
				}
			}
		})
		let friendList: any[] = [];
		if(user.Friends !== undefined)
		{
			user.Friends.forEach((element) => {
				element.Users.forEach((e) => {
					if (e.id !== user.id)
						friendList.push(e);
				})
			})
		}
		return res.send(friendList);
	}

	@Get('acceptFriend/:friendName')///
	@UseGuards(JwtGuard)
	async AddFriend(
		@Req() req: Request,
		@Param('friendName') friendName: string)
	{
		const userID: number = parseInt(req.body.toString(), 10);
		const targetUser = await this.userService.getUserByNick(friendName);
		await this.prisma.friend.create({
			data: {
				Users: {
					connect: [{ id: userID, },{  id: targetUser.id}],
				}
			}
		})
		await this.prisma.friendRequest.deleteMany({
			where: {
				AND: [
					{ Users: { some: { id: userID } } },
					{ Users: { some: { id: targetUser.id } } },
				],
			},
		});
	}

	@Get('rejectFriend/:friendName')///
	@UseGuards(JwtGuard)
	async RejectFriend(
		@Req() req: Request,
		@Param('friendName') friendName: string)
	{
		const userID: number = parseInt(req.body.toString(), 10);
		const targetUser = await this.userService.getUserByNick(friendName);

		await this.prisma.friendRequest.deleteMany({
			where: {
				AND: [
					{ Users: { some: { id: userID } } },
					{ Users: { some: { id: targetUser.id } } },
				],
			},
		});
	}

	@Get('findUser/:user')///
	@UseGuards(JwtGuard)
	async FindUser(
		@Req() req: Request,
		@Res() res: Response,
		@Param('user') finduser: string)
	{
		console.log(finduser + " searching...");
		try{
			const targetUser = await this.userService.getUserByNick(finduser, {
			FriendRequests: {
				include: {
					Users: true,
				}
			},
			Friends: {
				include: {
					Users: true,
				}
			},
		});

		// if (!targetUser)
		// 	return res.send({res: -1, message: "User couldn't be found!!"});

		const userID: number = parseInt(req.body.toString(), 10);
		if (targetUser.FriendRequests !== undefined && targetUser.FriendRequests.some((element) => element.Users.some((e) => e.id === userID)))
			return res.send({res: -2, message: "The friend invitation has already been sended!"})
		if (targetUser.Friends !== undefined && targetUser.Friends.some((element) => element.Users.some((e) => e.id === userID)))
			return res.send({res: -3, message: "The user is already your friend!"})
		await this.prisma.friendRequest.create({
			data: {
				Users: {
					connect: [{ id: userID, },{  id: targetUser.id}],
				},
				SenderID: userID,
			}
		})}catch (error) {
			return res.send({res: -1, message: "User couldn't be found!!"});
		}
		return res.send({res: 0, message: "The user has been invited as a friend."})
	}

	@Get('friendRequests')
	@UseGuards(JwtGuard)
	async GetFriendRequest(
		@Res() res: Response,
		@Req() req: Request)
	{
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.prisma.user.findFirst({
			where: { id : userID },
			select : {
				id: true,
				FriendRequests: {
					include: {
						Users: true
					}
				}
			}
		})
		let friendRequestList: any[] = [];
		if(user.FriendRequests !== undefined)
		{
			user.FriendRequests = user.FriendRequests.filter(element => element.SenderID !== userID);
			user.FriendRequests.forEach((element) => {
				element.Users.forEach((e) => {
					if (e.id !== user.id)
						friendRequestList.push(e);
				})
			})
		}
		return res.send(friendRequestList);
	}

	@Get('/matchHistory/:nick')
	@UseGuards(JwtGuard)
	async GetHistory(
		@Req() req: Request,
		@Res() res: Response,
		@Param('nick') nick: string)
	{
		if (nick === "null")
		{
			const userID: number = parseInt(req.body.toString(), 10);
			const me = await this.userService.getUserByID(userID);
			nick = me.nick;
		}
		const user = await this.prisma.user.findFirst({
			where: { nick : nick },
			select : {
				nick: true,
				LatterLevel: true,
				MatchHistory: {
					orderBy: {
						id: 'desc',// You can use 'asc' for ascending or 'desc' for descending order
					},
					include: {
						User: true
					}
				}
			}
		})
		return res.send(user);
	}

}
