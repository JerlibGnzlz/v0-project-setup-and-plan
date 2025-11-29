import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class PastorJwtAuthGuard extends AuthGuard('pastor-jwt') {}

