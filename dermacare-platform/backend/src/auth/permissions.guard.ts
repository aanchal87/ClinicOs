import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;
    if (!userPayload || !userPayload.sub) {
      throw new UnauthorizedException('Authentication credentials missing or invalid.');
    }

    // Fetch user and their permissions from database
    const user = await this.prisma.user.findUnique({
      where: { id: userPayload.sub },
      include: {
        roleRelation: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is inactive or does not exist.');
    }

    // If user role is SUPER_ADMIN, they have all permissions
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    const userPermissions = user.roleRelation?.permissions.map(p => p.name) || [];
    
    // Check if user has ALL of the required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Forbidden. Insufficient permissions for this action.');
    }

    return true;
  }
}
