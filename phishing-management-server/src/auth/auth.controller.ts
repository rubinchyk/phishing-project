import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Controller for authentication endpoints: registration and login.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new administrator account.
   */
  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body);
  }

  /**
   * Authenticates an administrator and returns a JWT token.
   */
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}
