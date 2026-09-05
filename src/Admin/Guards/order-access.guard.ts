import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../Services/admin.service';
import { verifyFirebaseIdToken } from '../Services/firebase-admin.config';

// Order-history endpoints are reachable by two different identities that
// never overlap: an admin holding this backend's own JWT (issued at
// /admin/signin), or a customer holding a Firebase ID token (issued by
// Firebase client auth on login). Neither can be told apart from a bare
// query-string email - see the getAllBuyingHistories IDOR fix - so this
// guard requires ONE of those two to verify, and stamps the request with
// only what was actually proven, never what the caller merely claims.
//
// req.isVerifiedAdmin - true only for a valid, non-blacklisted backend
//   admin JWT.
// req.verifiedEmail - the email from a valid Firebase ID token; only set
//   on the customer path, never trusted from any other source.
//
// A guest with neither token is rejected here on purpose - order lookup
// for guests goes through the existing per-order tracking-token flow
// instead of an email-keyed list.
@Injectable()
export class OrderAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      const blacklisted = await this.adminService.isTokenBlacklisted(
        payload.jti,
      );
      if (blacklisted) {
        throw new UnauthorizedException('Token revoked');
      }
      req.isVerifiedAdmin = payload.role === 'admin';
      req.user = payload;
      return true;
    } catch {
      // Not a valid backend JWT - fall through and try it as a Firebase
      // ID token instead.
    }

    try {
      const decoded = await verifyFirebaseIdToken(token);
      if (!decoded.email) {
        throw new UnauthorizedException('Token has no email');
      }
      req.verifiedEmail = decoded.email;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
