import { Controller, Get, Param, ParseIntPipe, Req, Res, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/strategies/jwt/jwt.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { Response } from 'express';
import { connectedClients } from 'src/chat/chat.service';
import { clientInfo } from 'src/chat/entities/clientInfo.entity';

@Controller('game')
export class GameController {
	constructor(
		private userService: UserService,
		private prisma: PrismaService)
		{}
	
	@Get('/gameInvitations')
	@UseGuards(JwtGuard)
	async getGameInvitation(
		@Req() req: Request,
		@Res() res: Response): Promise<any> {
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID, {GameInvitations: true});
		return res.send(user.GameInvitations);
	}

	@Get('/invite/:id')
	@UseGuards(JwtGuard)
	async invite(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', new ParseIntPipe()) rivalID: number,): Promise<any> {
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID);
		const invitation: any = await this.prisma.gameInvitation.findFirst({
			where: {
				inviterID: userID,
				UserID: rivalID,
			}
		})
		if (invitation)
			return res.send({msg: "The user has been already invited!!"});
		await this.prisma.gameInvitation.create({
			data: {
				inviterID: userID,
				inviterNick: user.nick,
				User: {
					connect: { id: rivalID },
		}}});
		return res.send({msg: "The user is invited to the game."});
	}
	
	@Get('/deleteInvitaton/:id')
	@UseGuards(JwtGuard)
	async rejectGameInvitation(
		@Req() req: Request,
		@Res() res: Response,
		@Param('id', new ParseIntPipe()) invitationID: number,): Promise<any> {
		const userID: number = parseInt(req.body.toString(), 10);
		await this.prisma.gameInvitation.delete({where: {id: invitationID}})
		const cli: clientInfo = connectedClients.find(e => (e.id === userID));
		if (cli)
			cli.client.emit("GameInvitation");
		return res.send({msg: "The game invitation is deleted."});
	}

	@Get('/result/:id/:myScore/:rivalScore')
	@UseGuards(JwtGuard)
	async GetSaveResult(
		@Req() req: Request,
		// @Res() res: Response,
		@Param('id', new ParseIntPipe()) rivalID: number,
		@Param('myScore', new ParseIntPipe()) myScore: number,
		@Param('rivalScore', new ParseIntPipe()) rivalScore: number): Promise<any>{
		const userID: number = parseInt(req.body.toString(), 10);
		let user = await this.userService.getUserByID(userID, {Achievements: true});
		const rival = await this.userService.getUserByID(rivalID, {Achievements: true});

		console.log("GAME RESULT");
		console.log("Match: ", userID, " ", rivalID, " ", myScore, "-", rivalScore);
		//Save History to DB
		try{
			await this.prisma.history.create({
				data: {
					RivalNick: rival.nick,
					Score: myScore,
					RivalLatter: rival.LatterLevel,
					Latter: user.LatterLevel,
					RivalScore: rivalScore,
					User: {
						connect: { id: userID },
			}}})
			await this.prisma.history.create({
				data: {
					RivalNick: user.nick,
					RivalLatter: user.LatterLevel,
					Score: rivalScore,
					RivalScore: myScore,
					Latter: rival.LatterLevel,
					User: {
						connect: { id: rivalID },
		}}})}
		catch(error){
			console.log("Error when creating History (on DB)");
		}

		const newUserWin:number = user.WinCount + 1;

		if (newUserWin === 1)
		{
			user.Achievements.Ac1 = true;
		}
		if (newUserWin === 10)
		{
			user.Achievements.Ac3 = true;
		}
		if (newUserWin === 5 && user.LoseCount === 0)
		{
			user.Achievements.Ac4 = true;
		}
		if (newUserWin === 10 && user.LoseCount === 0)
		{
			user.Achievements.Ac5 = true;
		}
		if (rivalScore === 0)
		{
			user.Achievements.Ac6 = true;
		}
		if (rival.LoseCount + 1 === 1)
		{
			rival.Achievements.Ac2 = true;
		}

		await this.userService.updateUserByID({
			WinCount: newUserWin,
			LatterLevel: user.LatterLevel + 100,
			Achievements: {
				update: {
					Ac1: user.Achievements.Ac1,
					Ac2: user.Achievements.Ac2,
					Ac3: user.Achievements.Ac3,
					Ac4: user.Achievements.Ac4,
					Ac5: user.Achievements.Ac5,
					Ac6: user.Achievements.Ac6
				}
			}
		}, userID);

		await this.userService.updateUserByID({
			LoseCount: rival.LoseCount + 1,
			LatterLevel: rival.LatterLevel - 50,
			Achievements: {
				update: {
					Ac1: rival.Achievements.Ac1,
					Ac2: rival.Achievements.Ac2,
					Ac3: rival.Achievements.Ac3,
					Ac4: rival.Achievements.Ac4,
					Ac5: rival.Achievements.Ac5,
					Ac6: rival.Achievements.Ac6
				}
			}
		}, rivalID);
		return;
	}
}
