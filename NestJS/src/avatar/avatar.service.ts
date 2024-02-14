import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AvatarService {
    constructor (private prisma: PrismaService){}

	async changeAvatar(file: any, userID: number)
	{
        const directoryPath = './Avatars/';
        if(file === undefined)
        {
            let res: string;
            fs.copyFile("./default.jpeg", `${directoryPath}${userID}.jpeg`, async (err) => {
                if (err) {
                    res = 'Error copying the image';
                } else {
                    await this.prisma.user.update({
                        where: {
                            id: userID
                        },
                        data: { ImageExt: ".jpeg" }
                    });
                    res = 'Default.jpeg saved as image successfully.';
                }
            });
            return res;
        }
		const ext = file.substring(file.indexOf('/') + 1, file.indexOf(';'));
        const AvatarFileName = userID + '.' + ext;
        const base64Image = file.split(';base64,').pop();

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
        //Hint: !! delete thwe old one
        await this.deleteTheOldestWriteNew(directoryPath, userID, AvatarFileName, base64Image);
        console.log(`${directoryPath}${AvatarFileName}`);
        await this.prisma.user.update({
            where: {
                id: userID
            },
            data: { ImageExt: "." + ext }
        });
        console.log("File uploadad successfully!");
        return "File uploadad successfully!";
	}

    async deleteTheOldestWriteNew(directoryPath: string, id: number, AvatarFileName: string, base64Image: any){
        const user = await this.prisma.user.findFirst({ where: { id: id, }});
        // if there is no file that means that there is no extention Uyarı:::!!!!
        if(user.ImageExt)
            await fs.unlinkSync(directoryPath + "/" + user.id.toString() + user.ImageExt);
        try { await fs.writeFileSync(`${directoryPath}${AvatarFileName}`, base64Image, { encoding: 'base64' });}
        catch(error) { return "Write error!" }
    }

    OpenImgFromUser(user: any): any{
        const imagePath: string = "./Avatars/" + user.id + user.ImageExt;
        const imgBuffer = fs.readFileSync(imagePath).toString('base64');
        return imgBuffer;
    }
}
