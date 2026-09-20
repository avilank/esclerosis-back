/** Payload que firma `JwtUtil.generateToken` en el login/registro. */
export interface JwtPayload {
  id: number;
  email: string;
  username: string;
  rol: string;
  iat?: number;
  exp?: number;
}

/** Request de Express con el usuario ya resuelto por `JwtAuthGuard`. */
export interface RequestWithUser extends Request {
  user?: JwtPayload;
}
