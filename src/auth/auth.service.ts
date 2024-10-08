import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async generateToken(
    email: string,
  ): Promise<{ token: string; createdAt: string }> {
    const currentToken = await this.prismaService.apiKey.findUnique({
      where: { email: email },
    });

    if (currentToken) {
      return {
        token: currentToken.key,
        createdAt: currentToken.createdAt.toISOString(),
      };
    }

    const payload = { email: email };
    const token = this.jwtService.sign(payload);

    await this.prismaService.apiKey.create({
      data: { email: email, key: token },
    });

    return { token, createdAt: new Date().toISOString() };
  }
}
