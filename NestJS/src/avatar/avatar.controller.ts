import { Body, Headers, Res, Post, Controller} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/jwtconstants';
import { merge } from 'rxjs';

@Controller('avatar')
export class AvatarController {
    constructor(private avatarService: AvatarService, private userService: UserService, private jwtService: JwtService) {}

    // 75 kb den küçükler
    @Post('upload')
    async uploadAvatar(
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
		    return res.send("Incorrect token!!");
        }
        try
        {
            const file: any = body.file;
            return res.send(await this.avatarService.changeAvatar(file, userID));
        }
        catch(error) { console.log("Avatar upload error!"); return res.send("Avatar upload error!"); }
    }
}
