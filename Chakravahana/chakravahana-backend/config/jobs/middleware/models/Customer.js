const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Customer Schema 
 */
const customerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required '],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required -'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email - '
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required - '],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required - '],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  
  // Profile Information - 
  profileImage: {
    type: String,
    default: null
  },
  
  dateOfBirth: {
    type: Date
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  
  // Address Information - 
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true,
      default: 'Telangana'
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, 'Invalid pincode format']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Vehicle Information - 
  vehicles: [{
    vehicleType: {
      type: String,
      enum: ['bike', 'car', 'auto', 'truck'],
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true,
      min: 1990,
      max: new Date().getFullYear() + 1
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'cng'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Account Status - 
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Preferences - 
  preferences: {
    language: {
      type: String,
      enum: ['english', 'telugu', 'hindi'],
      default: 'telugu'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Rating and Reviews - 
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Statistics - గణాంకాలు
  totalBookings: {
    type: Number,
    default: 0
  },
  
  totalSpent: {
    type: Number,
    default: 0
  },
  
  // Security - భద్రత
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  emailVerificationToken: String,
  emailVerificationExpire: Date

}, {
  timestamps: true, // createdAt మరియు updatedAt ఆటోమేటిక్ గా add చేస్తుంది
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for age calculation
customerSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
});

// Index for better performance - పనితీరు మెరుగుపరచడానికి ఇండెక్స్
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ 'addresses.coordinates': '2dsphere' });
customerSchema.index({ createdAt: -1 });

// Middleware - మిడిల్వేర్

// Pre-save middleware to hash password
customerSchema.pre('save', async function(next) {
  // Password hash చేయడం save చేయడానికి ముందు
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Ensure only one default address
customerSchema.pre('save', function(next) {
  if (this.addresses && this.addresses.length > 0) {
    let defaultCount = 0;
    this.addresses.forEach(address => {
      if (address.isDefault) defaultCount++;
    });
    
    if (defaultCount === 0) {
      this.addresses[0].isDefault = true;
    } else if (defaultCount > 1) {
      // Keep only the first default address
      let foundFirst = false;
      this.addresses.forEach(address => {
        if (address.isDefault && !foundFirst) {
          foundFirst = true;
        } else if (address.isDefault && foundFirst) {
          address.isDefault = false;
        }
      });
    }
  }
  next();
});

// Instance Methods - ఇన్స్టెన్స్ మెథడ్లు

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get JWT token
customerSchema.methods.getJWTToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      type: 'customer',
      phone: this.phone 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate password reset token
customerSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Check if account is locked
customerSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
customerSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours lock
    };
  }
  
  return this.updateOne(updates);
};

// Static Methods - స్టాటిక్ మెథడ్లు

// Find customers near location
customerSchema.statics.findNearLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    'addresses.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

// Get customer statistics
customerSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        activeCustomers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedCustomers: {
          $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
        },
        totalVehicles: { $sum: { $size: '$vehicles' } },
        avgRating: { $avg: '$rating.average' }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('Customer', customerSchema);