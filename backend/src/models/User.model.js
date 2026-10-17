import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Citizen name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in queries
      default: () => Math.random().toString(36).slice(-8) + 'A1!',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
    state: {
      type: String,
      trim: true,
      default: 'Karnataka',
    },
    occupation: {
      type: String,
      trim: true,
      default: 'Farmer',
    },
    age: {
      type: Number,
      min: [1, 'Age must be positive'],
      max: [120, 'Age must be valid'],
      default: 35,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Transgender', 'Other', 'Not specified'],
      default: 'Not specified',
    },
    annualIncome: {
      type: String,
      default: 'Below ₹2,50,000',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'kn', 'ta', 'te', 'mr', 'bn'],
      default: 'en',
    },
    role: {
      type: String,
      enum: ['citizen', 'admin'],
      default: 'citizen',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
