import { Injectable } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user) {
      const authResult = await bcrypt.compare(pass, user.password);
      if (authResult) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  async login(user: User) {
    const storedUser = await this.usersService.findOne(user.username);
    const payload = { username: user.username, sub: storedUser.userId };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.refreshToken(payload.sub),
    };
  }

  private refreshToken(sub: string): string {
    return this.jwtService.sign(
      { sub },
      {
        secret: `${process.env.JWT_SECRET}`,
        expiresIn: '1d',
      },
    );
  }
}
