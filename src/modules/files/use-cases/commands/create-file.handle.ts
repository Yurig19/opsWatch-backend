import * as fs from 'node:fs';
import * as path from 'node:path';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/exceptions/app.error';
import { CreateFileDto } from '@/modules/files/dtos/create-file.dto';
import { ReadFileDto } from '@/modules/files/dtos/read-file.dto';
import { FilesService } from '@/modules/files/services/files.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFileCommand } from './create-file.command';

@CommandHandler(CreateFileCommand)
export class CreateFileHandler implements ICommandHandler<CreateFileCommand> {
  constructor(private readonly fileService: FilesService) {}

  async execute(command: CreateFileCommand): Promise<ReadFileDto> {
    const { mkdirSync, existsSync, promises } = fs;

    const file = command.file;
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    try {
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, file.originalname);
      await promises.writeFile(filePath, file.buffer);

      const createFileDto: CreateFileDto = {
        filename: file.originalname,
        mimetype: file.mimetype,
        path: filePath,
        size: file.size,
      };

      const savedFile = await this.fileService.create(createFileDto);

      return <ReadFileDto>{
        uuid: savedFile.uuid,
        filename: savedFile.filename,
        mimetype: savedFile.mimetype,
        path: savedFile.path,
        size: savedFile.size,
        createdAt: savedFile.createdAt,
        updatedAt: savedFile.updatedAt,
        deletedAt: savedFile.deletedAt,
      };
    } catch (error) {
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }
}
