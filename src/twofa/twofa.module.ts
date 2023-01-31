import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TwofaController } from 'src/twofa/twofa.controller';
import { TwofaService } from 'src/twofa/twofa.service';

@Module({
  providers: [TwofaService],
  imports: [AuthModule],
  exports: [TwofaService],
  controllers: [TwofaController],
})
export class TwofaModule {}
