import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AllergensService } from './allergens.service';
import { AllergensController } from './allergens.controller';
import { Allergen } from './entities/allergen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Allergen])],
  controllers: [AllergensController],
  providers: [AllergensService],
  exports: [AllergensService],
})
export class AllergensModule {}
