import { Controller, Get, Post , Body, Res, UseGuards, Headers} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth/42')
export class AuthController {
	constructor(private authService: AuthService){}

	// {Jwt_Token, 0} The new user has been saved in database and the token has been created.
	// {Jwt_Token, 1} The user has already been saved in database and the token has been created.
	// {Jwt_Token, 2} The user should be redirected to the TFA page.
	// {msg,      -1} The user couldn't log in.
	@Post('signin_intra')
	async signin_intra(@Headers('authorization') head: string, @Body() data: any) {
		if(!data)
			return("404 Not Found");
		return (this.authService.signin_intra(data));
	}
}
