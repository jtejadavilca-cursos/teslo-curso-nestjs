import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  executeSeed(
    @Query('forceInsert') forceInsert: boolean,
  ) {
    return this.seedService.executeSeed(forceInsert);
  }

}
