import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Body,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Get(':id')
  findById(@Param('id') id: string) {
    this.logger.log(`GET /user/${id}`);
    return this.userService.findById(id);
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
