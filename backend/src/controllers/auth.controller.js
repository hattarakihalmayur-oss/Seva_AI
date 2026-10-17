import User from '../models/User.model.js';
import { generateToken } from '../utils/token.js';
import logger from '../utils/logger.js';

/**
 * POST /api/auth/register
 * Register a new citizen account
 */
export async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
      phone,
      state,
      occupation,
      age,
      gender,
      annualIncome,
      preferredLanguage,
    } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name is required.', code: 'VALIDATION_ERROR' },
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email address is required.', code: 'VALIDATION_ERROR' },
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters long.', code: 'VALIDATION_ERROR' },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email address already exists. Please log in.',
          code: 'EMAIL_ALREADY_EXISTS',
        },
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      state: state || 'Karnataka',
      occupation: occupation || 'Farmer',
      age: age ? parseInt(age, 10) : 35,
      gender: gender || 'Not specified',
      annualIncome: annualIncome || 'Below ₹2,50,000',
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = generateToken({ id: user._id, role: user.role });

    logger.info(`New citizen registered: ${user._id} (${user.email})`);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      occupation: user.occupation,
      age: user.age,
      gender: user.gender,
      annualIncome: user.annualIncome,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
      message: 'Citizen account created successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate citizen and issue JWT
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please provide both email address and password.',
          code: 'MISSING_CREDENTIALS',
        },
      });
    }

    // Retrieve user with password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email address or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Compare bcrypt password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email address or password.',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      occupation: user.occupation,
      age: user.age,
      gender: user.gender,
      annualIncome: user.annualIncome,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Logged in successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export async function getMe(req, res) {
  res.status(200).json({
    success: true,
    user: req.user,
  });
}

/**
 * PUT /api/auth/profile
 * Update citizen profile attributes and preferred language
 */
export async function updateProfile(req, res, next) {
  try {
    const allowedUpdates = [
      'name',
      'phone',
      'state',
      'occupation',
      'age',
      'gender',
      'annualIncome',
      'preferredLanguage',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Citizen profile updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/otp/generate
 * Generate 6-digit OTP for mobile sign in
 */
export async function generateOtp(req, res, next) {
  try {
    const rawMobile = req.body.mobile || req.body.phone || req.body.email || '';
    const cleanPhone = rawMobile.toString().replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please enter a valid 10-digit Indian mobile number.',
          code: 'INVALID_MOBILE',
        },
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({
      $or: [{ phone: cleanPhone }, { email: `${cleanPhone}@citizen.gov.in` }],
    });

    if (!user) {
      // Auto-create citizen profile if this mobile is signing in for the first time
      user = await User.create({
        name: `Citizen ${cleanPhone.slice(-4)}`,
        email: `${cleanPhone}@citizen.gov.in`,
        phone: cleanPhone,
        state: 'Karnataka',
        occupation: 'Farmer',
        age: 30,
        gender: 'Not specified',
        annualIncome: 'Below ₹2,50,000',
        preferredLanguage: 'en',
      });
    }

    user.otpCode = otp;
    user.otpExpiresAt = expiry;
    await user.save();

    logger.info(`[AUTH-OTP] Generated OTP for mobile: +91-******${cleanPhone.slice(-4)}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to +91 ******${cleanPhone.slice(-4)}. Valid for 10 minutes.`,
      mobile: cleanPhone,
      otp, // provided for testing convenience
      expiresInSeconds: 600,
    });
  } catch (error) {
    logger.error('Error generating mobile OTP', error);
    next(error);
  }
}

/**
 * POST /api/auth/otp/verify
 * Verify OTP and authenticate citizen
 */
export async function verifyOtp(req, res, next) {
  try {
    const rawMobile = req.body.mobile || req.body.phone || '';
    const cleanPhone = rawMobile.toString().replace(/\D/g, '').slice(-10);
    const otp = (req.body.otp || '').toString().trim();

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please enter a valid 10-digit Indian mobile number.',
          code: 'INVALID_MOBILE',
        },
      });
    }

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please enter a valid 6-digit OTP.',
          code: 'INVALID_OTP',
        },
      });
    }

    const user = await User.findOne({
      $or: [{ phone: cleanPhone }, { email: `${cleanPhone}@citizen.gov.in` }],
    }).select('+otpCode +otpExpiresAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No citizen account found for this mobile number. Please register first or click Send OTP to auto-register.',
          code: 'CITIZEN_NOT_FOUND',
        },
      });
    }

    // Verify OTP code (allow standard demo OTP 123456 or generated otp)
    const isMasterDemoOtp = otp === '123456';
    const isGeneratedOtpValid = user.otpCode === otp && user.otpExpiresAt && new Date(user.otpExpiresAt) > new Date();

    if (!isMasterDemoOtp && !isGeneratedOtpValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Incorrect or expired OTP. Please enter the valid 6-digit OTP or generate a new one.',
          code: 'INVALID_OR_EXPIRED_OTP',
        },
      });
    }

    // Clear used OTP
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    logger.info(`[AUTH-OTP] Citizen successfully authenticated via mobile OTP: ${user._id} (${user.phone})`);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      occupation: user.occupation,
      age: user.age,
      gender: user.gender,
      annualIncome: user.annualIncome,
      preferredLanguage: user.preferredLanguage,
      role: user.role,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: 'Mobile OTP verified successfully. Logged in.',
    });
  } catch (error) {
    logger.error('Error verifying mobile OTP', error);
    next(error);
  }
}

export default {
  register,
  login,
  getMe,
  updateProfile,
  generateOtp,
  verifyOtp,
};
