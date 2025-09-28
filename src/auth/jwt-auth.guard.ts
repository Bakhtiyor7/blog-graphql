// jwt-auth.guard.ts (REST)
import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(ctx: ExecutionContext) {
        return super.canActivate(ctx)
    }
}
