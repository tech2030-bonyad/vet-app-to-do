/**
 * Authentication routes
 * Handles user registration, login, profile management, and token refresh
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import UserModel, { CreateUserData, UpdateUserData } from '../models/User';
import { PasswordUtils } from '../utils/password';
import { JwtUtils } from '../utils/jwt';
import { validateAuth } from '../middleware/validateAuth';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((password: string) => {
      const validation = PasswordUtils.validatePasswordStrength(password);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
      return true;
    }),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileValidation = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
];

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', registerValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password, firstName, lastName } = req.body;

    // Hash the password
    const hashedPassword = await PasswordUtils.hashPassword(password);

    // Create user data
    const userData: CreateUserData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    };

    // Create the user
    const user = await UserModel.createUser(userData);

    // Generate tokens
    const tokens = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: UserModel.toUserResponse(user),
        tokens,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message === 'User with this email already exists') {
      res.status(409).json({
        success: false,
        message: error.message,
        error: 'USER_EXISTS'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
      return;
    }

    // Generate tokens
    const tokens = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: UserModel.toUserResponse(user),
        tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /auth/profile
 * Get current user profile (protected route)
 */
router.get('/profile', validateAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // User information is available from the auth middleware
    const user = await UserModel.findById(req.user!.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: UserModel.toUserResponse(user),
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving profile',
      error: 'INTERNAL_ERROR'
    });
  }
});

/**
 * PUT /auth/profile
 * Update current user profile (protected route)
 */
router.put('/profile', validateAuth, updateProfileValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, firstName, lastName } = req.body;
    const userId = req.user!.id;

    // Prepare update data
    const updateData: UpdateUserData = {};
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        message: 'No valid fields provided for update',
        error: 'NO_UPDATE_DATA'
      });
      return;
    }

    // Update the user
    const updatedUser = await UserModel.updateUser(userId, updateData);
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: UserModel.toUserResponse(updatedUser),
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error instanceof Error && error.message === 'User with this email already exists') {
      res.status(409).json({
        success: false,
        message: error.message,
        error: 'EMAIL_EXISTS'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile',
        error: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'MISSING_REFRESH_TOKEN'
      });
      return;
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = JwtUtils.verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Invalid refresh token',
        error: 'INVALID_REFRESH_TOKEN'
      });
      return;
    }

    // Find user
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
      return;
    }

    // Generate new tokens
    const tokens = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh',
      error: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /auth/logout
 * Logout user (protected route)
 * Note: In a production environment, you might want to implement token blacklisting
 */
router.post('/logout', validateAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // In a stateless JWT implementation, logout is handled client-side
    // The client should remove the tokens from storage
    // In production, you might want to implement token blacklisting
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: null,
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: 'INTERNAL_ERROR'
    });
  }
});

export default router;