import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class InvitadoJwtAuthGuard extends AuthGuard('invitado-jwt') {}

