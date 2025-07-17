import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

interface TokenPayload {
  userId: number;
  type: 'access' | 'refresh';
  random?: string;
}

interface CreateSessionResult {
  session: any;
  accessToken: string;
  refreshToken: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly JWT_EXPIRY = '1h';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateTokens(userId: number): TokenPair {
    const accessToken = jwt.sign(
      { userId, type: 'access' } as TokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: this.JWT_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, type: 'refresh', random: randomBytes(16).toString('hex') } as TokenPayload,
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }

  static async createSession(
    userId: number, 
    userAgent?: string, 
    ipAddress?: string
  ): Promise<CreateSessionResult> {
    const { accessToken, refreshToken } = this.generateTokens(userId);
    
    const session = await prisma.userSession.create({
      data: {
        userId,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        userAgent,
        ipAddress,
      },
    });

    return { session, accessToken, refreshToken };
  }

  static async validateToken(token: string): Promise<{ userId: number } | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      
      if (decoded.type !== 'access') return null;
      
      const session = await prisma.userSession.findFirst({
        where: {
          token,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) return null;

      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }

  static async refreshToken(refreshToken: string): Promise<TokenPair | null> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
      
      if (decoded.type !== 'refresh') return null;

      const session = await prisma.userSession.findFirst({
        where: {
          refreshToken,
          isActive: true,
        },
      });

      if (!session) return null;

      const tokens = this.generateTokens(decoded.userId);
      
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      return tokens;
    } catch {
      return null;
    }
  }

  static async logout(token: string): Promise<void> {
    await prisma.userSession.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }

  static async logoutAll(userId: number): Promise<void> {
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await prisma.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isActive: false },
        ],
      },
    });
  }

  static async getUserSessions(userId: number): Promise<any[]> {
    return prisma.userSession.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async revokeSession(sessionId: string, userId: number): Promise<boolean> {
    try {
      await prisma.userSession.updateMany({
        where: {
          id: sessionId,
          userId,
        },
        data: {
          isActive: false,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  static async validateUser(email: string, password: string): Promise<any | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        subscriptionStatus: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) return null;

    const isValid = await this.validatePassword(password, user.passwordHash);
    if (!isValid) return null;

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async createUser(userData: {
    email: string;
    password: string;
    role?: 'USER' | 'VENUE_OWNER' | 'ADMIN';
  }): Promise<any> {
    const passwordHash = await this.hashPassword(userData.password);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        role: userData.role || 'USER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        subscriptionStatus: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) return false;

    const isCurrentPasswordValid = await this.validatePassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) return false;

    const newPasswordHash = await this.hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate all sessions for security
    await this.logoutAll(userId);

    return true;
  }

  static async resetPassword(email: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) return null;

    // Generate a secure temporary password
    const tempPassword = randomBytes(16).toString('hex');
    const tempPasswordHash = await this.hashPassword(tempPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: tempPasswordHash },
    });

    // Invalidate all sessions
    await this.logoutAll(user.id);

    return tempPassword;
  }
}