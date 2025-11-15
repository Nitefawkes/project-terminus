import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreatePinDto } from './dto/create-pin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    return this.usersService.findOne(userId);
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.id;
    return this.usersService.update(userId, updateUserDto);
  }

  @Put('preferences')
  async updatePreferences(
    @Request() req,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    const userId = req.user.id;
    return this.usersService.updatePreferences(userId, updatePreferencesDto);
  }

  @Get('pins')
  async getPins(@Request() req) {
    const userId = req.user.id;
    return this.usersService.getPins(userId);
  }

  @Post('pins')
  async createPin(@Request() req, @Body() createPinDto: CreatePinDto) {
    const userId = req.user.id;
    return this.usersService.createPin(userId, createPinDto);
  }

  @Delete('pins/:id')
  async deletePin(@Request() req, @Param('id') pinId: string) {
    const userId = req.user.id;
    await this.usersService.deletePin(userId, pinId);
    return { message: 'Pin deleted successfully' };
  }
}

