/**
 * JWT utility functions for token generation and verification
 * Handles JWT token lifecycle management
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtUtils {
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  /**
   * Generate access token
   * @param payload - JWT payload containing user information
   * @returns string - Signed JWT access token
   */
  static generateAccessToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, config.jwtSecret, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        issuer: config.appName,
        audience: config.appName,
      });
    } catch (error) {
      console.error('Error generating access token:', error);
      throw new Error('Failed to generate access token');
    }
  }

  /**
   * Generate refresh token
   * @param payload - JWT payload containing user information
   * @returns string - Signed JWT refresh token
   */
  static generateRefreshToken(payload: JwtPayload): string {
    try {
      return jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        issuer: config.appName,
        audience: config.appName,
      });
    } catch (error) {
      console.error('Error generating refresh token:', error);
      throw new Error('Failed to generate refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   * @param payload - JWT payload containing user information
   * @returns TokenPair - Object containing both tokens
   */
  static generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Verify access token
   * @param token - JWT token to verify
   * @returns JwtPayload - Decoded token payload
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: config.appName,
        audience: config.appName,
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        console.error('Error verifying access token:', error);
        throw new Error('Failed to verify access token');
      }
    }
  }

  /**
   * Verify refresh token
   * @param token - JWT refresh token to verify
   * @returns JwtPayload - Decoded token payload
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret, {
        issuer: config.appName,
        audience: config.appName,
      }) as JwtPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        console.error('Error verifying refresh token:', error);
        throw new Error('Failed to verify refresh token');
      }
    }
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns string | null - Extracted token or null if invalid format
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }
}