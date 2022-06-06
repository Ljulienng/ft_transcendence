import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CreatePongDto } from './dto/create-pong.dto';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
  constructor(private pongService: PongService) {}

  @Get()
  async get(): Promise<any[]> {
    return ['titi'];
  }

  @Get(':id')
  getOne(@Param('id') id: string): string {
    return `Found id : ${id}`;
  }

  @Post()
  async create(@Body() createPongDto: CreatePongDto) {
    // this.pongService.create(createPongDto);
  }
}
