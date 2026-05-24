import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComplainService } from './complain.service';
import { ComplainController } from './complain.controller';
import { Complain, ComplainSchema } from './complain.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Complain.name, schema: ComplainSchema }])],
  controllers: [ComplainController],
  providers: [ComplainService],
  exports: [ComplainService],
})
export class ComplainModule {}