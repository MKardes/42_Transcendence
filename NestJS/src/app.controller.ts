import { Controller, Get, Res, Req, UseGuards, Param} from '@nestjs/common';
import { Response} from 'express';
import { JwtGuard } from './auth/strategies/jwt/jwt.guard';
import { AvatarService } from './avatar/avatar.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
	constructor(
		private prisma: PrismaService,
		private avatarService: AvatarService){}

	@Get('leaderboard')
	@UseGuards(JwtGuard)
	async getLeaderboard(@Res() response : Response){
		const users = await this.prisma.user.findMany({
			orderBy: {
				LatterLevel: 'desc',
			}
		})
		let retUsers: any[] = [];
		users.forEach((element) => {
			retUsers.push({...element, imgBuffer: this.avatarService.OpenImgFromUser(element)});
		})
		return response.send(retUsers);
	}
}
