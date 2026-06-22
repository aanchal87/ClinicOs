import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Res, Req, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import * as express from 'express';
import { Public } from './public.decorator';

@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle({ auth: { limit: 5, ttl: 60000 } })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.registerDoctor(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: any,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const result = await this.authService.loginDoctor(loginDto, ip);
    
    // Set httpOnly secure refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Exclude refreshToken from the returned json for frontend security
    const { refreshToken, ...responseBody } = result;
    return responseBody;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: express.Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const cookies = req.headers.cookie ? Object.fromEntries(
      req.headers.cookie.split(';').map(c => {
        const parts = c.trim().split('=');
        return [parts[0], parts.slice(1).join('=')];
      })
    ) : {};
    
    const token = cookies['refreshToken'] || req.body.refreshToken;
    
    const result = await this.authService.refresh(token, ip);

    // Rotate refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: express.Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const cookies = req.headers.cookie ? Object.fromEntries(
      req.headers.cookie.split(';').map(c => {
        const parts = c.trim().split('=');
        return [parts[0], parts.slice(1).join('=')];
      })
    ) : {};
    
    const token = cookies['refreshToken'] || req.body.refreshToken;

    await this.authService.logout(token, ip);

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }
}
