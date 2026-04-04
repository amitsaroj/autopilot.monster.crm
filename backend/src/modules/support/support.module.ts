import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { Ticket } from '../../database/entities/ticket.entity';
import { Article } from '../../database/entities/article.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Article])],
  providers: [SupportService],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
