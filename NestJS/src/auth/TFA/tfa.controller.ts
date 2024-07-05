import { Controller, Get, Param,  Req, Res, UnauthorizedException, UseGuards, Headers } from '@nestjs/common';
import { TFAService } from './tfa.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as qrcode from 'qrcode';
import { UserService } from 'src/user/user.service';
import { JwtGuard } from 'src/auth/strategies/jwt/jwt.guard';
import { Request } from 'express';

@Controller('auth/tfa')
@ApiBearerAuth()
export class TFAController {
	constructor(private tfaService: TFAService, private userService: UserService) { }

	@Get('QR')
	@UseGuards(JwtGuard)
	async getQR(@Req() req, @Res() res) {
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID);
		const qrCode = await this.tfaService.getQR(user);
		const qrCodeBuffer = await qrcode.toBuffer(qrCode);
		res.set('Content-type', 'image/png');
		res.send(qrCodeBuffer);
	}

	@Get('enable')
	@UseGuards(JwtGuard)
	async enableTwoFactor(@Req() req, @Res() res){
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID);
		const tfa = await this.tfaService.generateTwoFactorAuthenticationSecret(user);
		const qrCodeBuffer = await qrcode.toBuffer(tfa.qrCode);
		res.set('Content-type', 'image/png');
		res.send(qrCodeBuffer);
	}

	@Get('disable')
	@UseGuards(JwtGuard)
	async disableTwoFactor(@Req() req, @Res() res) {
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID);
		await this.tfaService.disableTwoFactorAuthentication(user);
		return res.send({mes: "Disabled!"})
	}

	@Get('verify/:code')
	@UseGuards(JwtGuard)
	async verifyToken(
		@Req() req: Request,
		@Param('code') code: string)
	{
		const userID: number = parseInt(req.body.toString(), 10);
		const user = await this.userService.getUserByID(userID);
		const result = await this.tfaService.verifyTwoFactorAuthentication(code, user.TFSecret);
		if (result)
			return await this.tfaService.Login(user);
		throw new UnauthorizedException();
	}
}

