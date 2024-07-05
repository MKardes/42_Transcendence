import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { PrismaService } from 'src/prisma/prisma.service';""
import { UserService } from 'src/user/user.service';

@Injectable()
export class TFAService {
	constructor(
		private prisma: PrismaService,
		private userService: UserService,) { }

	getQR(user: any)
	{
		const qrCode = speakeasy.otpauthURL({
			secret: user.secretAscii,
			label: user.login,
			issuer: 'Transcendence',
		});
		return (qrCode);
	}

	async generateTwoFactorAuthenticationSecret(user: any) {
		const secret = speakeasy.generateSecret({ length: 20 });
		await this.prisma.user.update({
			where: {
				login: user.login,
			},
			data: {
				// TFAuth: true,
				TFSecret: secret.base32,
				secretAscii: secret.ascii
			},
		})
		const qrCode = speakeasy.otpauthURL({
			secret: secret.ascii,
			label: user.login,
			issuer: 'Transcendence',
		});
		return { qrCode, secret: secret.base32 }
	}

	async disableTwoFactorAuthentication(user: any) {
		await this.prisma.user.update({
			where: {
			  login: user.login,
			},
			data: {
				TFAuth: false,
				TFSecret: "",
				secretAscii: ""
			},
		})
	}

	async verifyTwoFactorAuthentication(twoFactorCode: string, userSecret: string): Promise<boolean> {
		const verified = await speakeasy.totp.verify({
			secret: userSecret,
			encoding: 'base32',
			token: twoFactorCode,
		});
		return verified;
	}

	async Login(user: any): Promise<{res: number, code: string} | {res: number}> {
		if (user.TFAuth === false)
		{
			await this.prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					TFAuth: true,
				},
			})
			return {res: 1, code: "TFA is enabled."};
		}
		console.log("You successfully logged in!!");
		return {res: 0};
	}
}
