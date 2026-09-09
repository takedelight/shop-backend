import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    this.logger.log('GET /user');
    return this.userService.findAll();
  }

  @Get('me')
  findById(@CurrentUser() payload: JwtPayload) {
    this.logger.log(`GET /user/${payload.sub}`);
    return this.userService.findById(payload.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    this.logger.log(`PATCH /user/${id}`);
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.logger.log(`DELETE /user/${id}`);
    return this.userService.delete(id);
  }
}
