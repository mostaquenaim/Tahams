// auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RbacService, TokenRejectedError } from 'src/Rbac/rbac.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly rbac: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Logged out, user gone, or issued before an access change
    // (tokenVersion) - same rules as the global AccessPolicyGuard.
    try {
      await this.rbac.validateTokenPayload(payload);
    } catch (err) {
      if (err instanceof TokenRejectedError) {
        throw new UnauthorizedException(err.message);
      }
      throw err;
    }
    return payload;
  }
}
