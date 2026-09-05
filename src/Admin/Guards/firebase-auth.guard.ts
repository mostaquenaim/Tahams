import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyFirebaseIdToken } from '../Services/firebase-admin.config';

// Requires a valid Firebase ID token and stamps req.verifiedEmail from it.
// Used where only a customer identity makes sense (no admin path exists),
// e.g. reading/writing a customer's own saved checkout address - never
// trust an email or id taken straight from the request for that.
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
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
