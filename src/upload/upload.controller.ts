import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@Controller('upload')
export class UploadController {
    @UseGuards(JwtAuthGuard) // protect if needed
    @Post('image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads', // mount a volume in prod
                filename: (_req, file, cb) => {
                    const unique =
                        Date.now() + '-' + Math.round(Math.random() * 1e9)
                    cb(null, `${unique}${extname(file.originalname)}`)
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (!file.mimetype.startsWith('image/')) {
                    return cb(
                        new BadRequestException('Invalid file type'),
                        false
                    )
                }
                cb(null, true)
            },
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        })
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file')
        // If using S3 instead of disk, upload here and return the S3 URL
        return { url: `/uploads/${file.filename}` }
    }
}
