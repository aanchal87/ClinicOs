import { Controller, Put, Param, Body, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Permissions } from './permissions.decorator';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Put(':id/status')
  @Permissions('MANAGE_USERS')
  async updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
    @Req() req: any
  ) {
    const user = req.user;
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied. Super Admin role required.');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Cannot modify status of a Super Admin user.');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, role: true, isActive: true }
    });
  }
}
