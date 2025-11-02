const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Mechanic Schema - మెకానిక్ స్కీమా
 * సేవా ప్రదాతల సమాచారం నిల్వ చేయడానికి
 */
const mechanicSchema = new mongoose.Schema({
  // Basic Information - ప్రాథమిక సమాచారం
  name: {
    type: String,
    required: [true, 'Name is required - పేరు అవసరం'],
    trim: true,
    maxLength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required - ఇమెయిల్ అవసరం'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required - ఫోన్ నంబర్ అవసరం'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required - పాస్వర్డ్ అవసరం'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Profile Information - ప్రొఫైల్ సమాచారం
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
  
  // Professional Information - వృత్తిపరమైన సమాచారం
  experience: {
    type: Number,
    required: [true, 'Experience is required - అనుభవం అవసరం'],
    min: [0, 'Experience cannot be negative']
  },
  
  specializations: [{
    type: String,
    enum: [
      'bike_repair', 'car_repair', 'auto_repair', 'truck_repair',
      'electrical', 'engine', 'brake', 'transmission', 'ac_repair',
      'battery', 'tire', 'oil_change', 'general_maintenance'
    ],
    required: true
  }],
  
  vehicleTypes: [{
    type: String,
    enum: ['bike', 'car', 'auto', 'truck'],
    required: true
  }],
  
  // Certification and Documents - ధృవీకరణలు మరియు పత్రాలు
  certifications: [{
    name: String,
    issuedBy: String,
    issuedDate: Date,
    expiryDate: Date,
    certificateImage: String
  }],
  
  documents: {
    aadharCard: {
      number: {
        type: String,
        match: [/^\d{12}$/, 'Invalid Aadhar number']
      },
      image: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    panCard: {
      number: {
        type: String,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number']
      },
      image: String,
      verified: {
        type: Boolean,
        default: false
      }
    },
    drivingLicense: {
      number: String,
      image: String,
      verified: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Business Information - వ్యాపార సమాచారం
  businessName: String,
  businessType: {
    type: String,
    enum: ['individual', 'partnership', 'company'],
    default: 'individual'
  },
  
  businessAddress: {
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
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  
  // Service Areas - సేవా ప్రాంతాలు
  serviceAreas: [{
    city: String,
    pincode: String,
    radius: {
      type: Number,
      default: 10 // kilometers
    }
  }],
  
  // Availability - అందుబాటు
  availability: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '18:00' }
    },
    saturday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '16:00' }
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: { type: String, default: '10:00' },
      endTime: { type: String, default: '14:00' }
    }
  },
  
  // Pricing - ధరలు
  pricing: {
    baseFee: {
      type: Number,
      default: 100
    },
    perKmCharge: {
      type: Number,
      default: 10
    },
    hourlyRate: {
      type: Number,
      default: 200
    },
    emergencyMultiplier: {
      type: Number,
      default: 1.5
    }
  },
  
  // Rating and Reviews - రేటింగ్ మరియు రివ్యూలు
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
    },
    breakdown: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // Account Status - ఖాతా స్థితి
  isActive: {
    type: Boolean,
    default: false // Admin approval required
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isOnline: {
    type: Boolean,
    default: false
  },
  
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  
  // Statistics - గణాంకాలు
  statistics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedBookings: {
      type: Number,
      default: 0
    },
    cancelledBookings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    responseTime: {
      average: {
        type: Number,
        default: 0 // in minutes
      }
    },
    completionRate: {
      type: Number,
      default: 0 // percentage
    }
  },
  
  // Bank Details - బ్యాంక్ వివరాలు
  bankDetails: {
    accountHolderName: String,
    accountNumber: {
      type: String,
      select: false // Don't return in queries by default
    },
    ifscCode: String,
    bankName: String,
    branchName: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Emergency Contact - అత్యవసర సంప్రదింపు
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  
  // Preferences - ప్రాధాన్యతలు
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
    autoAcceptBookings: {
      type: Boolean,
      default: false
    },
    maxBookingsPerDay: {
      type: Number,
      default: 10
    }
  },
  
  // Security - భద్రత
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes - ఇండెక్స్లు
mechanicSchema.index({ email: 1 });
mechanicSchema.index({ phone: 1 });
mechanicSchema.index({ 'businessAddress.coordinates': '2dsphere' });
mechanicSchema.index({ isActive: 1, isOnline: 1 });
mechanicSchema.index({ specializations: 1 });
mechanicSchema.index({ vehicleTypes: 1 });
mechanicSchema.index({ 'rating.average': -1 });

// Virtual fields - వర్చువల్ ఫీల్డ్లు
mechanicSchema.virtual('fullName').get(function() {
  return this.name;
});

mechanicSchema.virtual('completionRatePercentage').get(function() {
  if (this.statistics.totalBookings === 0) return 0;
  return Math.round((this.statistics.completedBookings / this.statistics.totalBookings) * 100);
});

// Middleware - మిడిల్వేర్

// Pre-save middleware to hash password
mechanicSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Calculate completion rate before save
mechanicSchema.pre('save', function(next) {
  if (this.statistics.totalBookings > 0) {
    this.statistics.completionRate = Math.round(
      (this.statistics.completedBookings / this.statistics.totalBookings) * 100
    );
  }
  next();
});

// Instance Methods - ఇన్స్టెన్స్ మెథడ్లు

// Compare password method
mechanicSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get JWT token
mechanicSchema.methods.getJWTToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id,
      type: 'mechanic',
      phone: this.phone 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Check if mechanic is available at given time
mechanicSchema.methods.isAvailableAt = function(dayOfWeek, time) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const daySchedule = this.availability[days[dayOfWeek]];
  
  if (!daySchedule.isAvailable) return false;
  
  const startTime = daySchedule.startTime.replace(':', '');
  const endTime = daySchedule.endTime.replace(':', '');
  const checkTime = time.replace(':', '');
  
  return checkTime >= startTime && checkTime <= endTime;
};

// Calculate distance from given coordinates
mechanicSchema.methods.calculateDistance = function(coordinates) {
  const geolib = require('geolib');
  return geolib.getDistance(
    { 
      latitude: this.businessAddress.coordinates.coordinates[1],
      longitude: this.businessAddress.coordinates.coordinates[0]
    },
    {
      latitude: coordinates[1],
      longitude: coordinates[0]
    }
  );
};

// Update online status
mechanicSchema.methods.updateOnlineStatus = function(isOnline) {
  this.isOnline = isOnline;
  return this.save();
};

// Static Methods - స్టాటిక్ మెథడ్లు

// Find mechanics near location
mechanicSchema.statics.findNearLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    isActive: true,
    isVerified: true,
    'businessAddress.coordinates': {
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

// Find available mechanics for service type
mechanicSchema.statics.findAvailableForService = function(serviceType, vehicleType, coordinates, maxDistance = 10000) {
  return this.find({
    isActive: true,
    isVerified: true,
    isOnline: true,
    specializations: serviceType,
    vehicleTypes: vehicleType,
    'businessAddress.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  }).sort({ 'rating.average': -1 });
};

module.exports = mongoose.model('Mechanic', mechanicSchema);
