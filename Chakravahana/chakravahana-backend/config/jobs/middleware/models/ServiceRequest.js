const mongoose = require('mongoose');

/**
 * Service Request Schema - సేవా అభ్యర్థన స్కీమా
 * వాహన సేవా బుకింగ్లను ట్రాక్ చేయడానికి
 */
const serviceRequestSchema = new mongoose.Schema({
  // Basic Information - ప్రాథమిక సమాచారం
  requestId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'CR' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
    }
  },
  
  // Customer Information - కస్టమర్ సమాచారం
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required - కస్టమర్ అవసరం']
  },
  
  // Mechanic Information - మెకానిక్ సమాచారం
  mechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic',
    default: null
  },
  
  // Vehicle Information - వాహన సమాచారం
  vehicle: {
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
    year: Number,
    registrationNumber: {
      type: String,
      required: true,
      uppercase: true
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'cng']
    }
  },
  
  // Service Details - సేవా వివరాలు
  serviceType: {
    type: String,
    enum: [
      'breakdown', 'maintenance', 'repair', 'inspection',
      'oil_change', 'tire_service', 'battery_service',
      'brake_service', 'ac_service', 'engine_service',
      'electrical_service', 'transmission_service'
    ],
    required: [true, 'Service type is required - సేవా రకం అవసరం']
  },
  
  problemDescription: {
    type: String,
    required: [true, 'Problem description is required - సమస్య వివరణ అవసరం'],
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  
  // Location Information - స్థాన సమాచారం
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
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
        default: 'Telangana'
      },
      pincode: {
        type: String,
        required: true
      }
    },
    landmark: String
  },
  
  // Scheduling - షెడ్యూలింగ్
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  
  preferredTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'flexible']
  },
  
  isEmergency: {
    type: Boolean,
    default: false
  },
  
  // Status Tracking - స్థితి ట్రాకింగ్
  status: {
    type: String,
    enum: [
      'pending',      // కేటాయించబడలేదు
      'assigned',     // మెకానిక్ కేటాయించబడింది
      'accepted',     // మెకానిక్ అంగీకరించింది
      'on_the_way',   // మెకానిక్ వస్తున్నాడు
      'in_progress',  // సేవ జరుగుతోంది
      'completed',    // పూర్తయింది
      'cancelled',    // రద్దు చేయబడింది
      'rejected'      // తిరస్కరించబడింది
    ],
    default: 'pending'
  },
  
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusHistory.updatedByModel'
    },
    updatedByModel: {
      type: String,
      enum: ['Customer', 'Mechanic', 'Admin']
    },
    comment: String
  }],
  
  // Pricing - ధర నిర్ణయం
  pricing: {
    estimatedCost: {
      type: Number,
      default: 0
    },
    finalCost: {
      type: Number,
      default: 0
    },
    breakdown: {
      serviceFee: {
        type: Number,
        default: 0
      },
      travelFee: {
        type: Number,
        default: 0
      },
      partsCost: {
        type: Number,
        default: 0
      },
      laborCost: {
        type: Number,
        default: 0
      },
      emergencyCharge: {
        type: Number,
        default: 0
      },
      tax: {
        type: Number,
        default: 0
      },
      discount: {
        type: Number,
        default: 0
      }
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  
  // Payment Information - చెల్లింపు సమాచారం
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet', 'bank_transfer'],
      default: 'cash'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundReason: String
  },
  
  // Time Tracking - సమయ ట్రాకింగ్
  timeTracking: {
    requestedAt: {
      type: Date,
      default: Date.now
    },
    assignedAt: Date,
    acceptedAt: Date,
    arrivedAt: Date,
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    
    // Calculated durations in minutes
    responseTime: Number, // Time to assign mechanic
    arrivalTime: Number,  // Time for mechanic to arrive
    serviceTime: Number   // Time to complete service
  },
  
  // Media Files - మీడియా ఫైల్లు
  images: {
    beforeService: [String], // Before service photos
    afterService: [String],  // After service photos
    documents: [String]      // Bills, receipts etc.
  },
  
  // Parts and Materials - భాగాలు మరియు మెటీరియల్స్
  partsUsed: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    warranty: {
      duration: Number, // in months
      terms: String
    }
  }],
  
  // Rating and Review - రేటింగ్ మరియు రివ్యూ
  customerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
  mechanicRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: Date
  },
  
  // Communication - కమ్యూనికేషన్
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'messages.senderModel'
    },
    senderModel: {
      type: String,
      enum: ['Customer', 'Mechanic']
    },
    message: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'location'],
      default: 'text'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Cancellation Information - రద్దు సమాచారం
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'cancellation.cancelledByModel'
    },
    cancelledByModel: {
      type: String,
      enum: ['Customer', 'Mechanic', 'Admin']
    },
    reason: {
      type: String,
      enum: [
        'customer_requested',
        'mechanic_unavailable', 
        'weather_conditions',
        'vehicle_moved',
        'payment_issue',
        'emergency',
        'other'
      ]
    },
    comment: String,
    cancelledAt: Date,
    refundAmount: Number,
    refundProcessed: {
      type: Boolean,
      default: false
    }
  },
  
  // Special Instructions - ప్రత్యేక సూచనలు
  specialInstructions: String,
  
  // Distance - దూరం
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  
  // Follow-up - తదుపరి చర్యలు
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    notes: String
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes - ఇండెక్స్లు
serviceRequestSchema.index({ requestId: 1 }, { unique: true });
serviceRequestSchema.index({ customer: 1 });
serviceRequestSchema.index({ mechanic: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ serviceType: 1 });
serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ scheduledFor: 1 });
serviceRequestSchema.index({ createdAt: -1 });

// Virtual Fields - వర్చువల్ ఫీల్డ్లు

serviceRequestSchema.virtual('totalDuration').get(function() {
  if (this.timeTracking.completedAt && this.timeTracking.startedAt) {
    return Math.round((this.timeTracking.completedAt - this.timeTracking.startedAt) / (1000 * 60));
  }
  return 0;
});

serviceRequestSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') return false;
  return new Date() > this.scheduledFor;
});

// Middleware - మిడిల్వేర్

// Update status history before saving
serviceRequestSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Calculate total cost before saving
serviceRequestSchema.pre('save', function(next) {
  if (this.pricing && this.pricing.breakdown) {
    const breakdown = this.pricing.breakdown;
    this.pricing.finalCost = 
      (breakdown.serviceFee || 0) +
      (breakdown.travelFee || 0) +
      (breakdown.partsCost || 0) +
      (breakdown.laborCost || 0) +
      (breakdown.emergencyCharge || 0) +
      (breakdown.tax || 0) -
      (breakdown.discount || 0);
  }
  next();
});

// Instance Methods - ఇన్స్టెన్స్ మెథడ్లు

// Update service status
serviceRequestSchema.methods.updateStatus = function(newStatus, updatedBy, comment) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    comment: comment
  });
  
  // Update time tracking
  const now = new Date();
  switch(newStatus) {
    case 'assigned':
      this.timeTracking.assignedAt = now;
      break;
    case 'accepted':
      this.timeTracking.acceptedAt = now;
      if (this.timeTracking.assignedAt) {
        this.timeTracking.responseTime = Math.round((now - this.timeTracking.assignedAt) / (1000 * 60));
      }
      break;
    case 'on_the_way':
      // No specific timestamp, but status is tracked
      break;
    case 'in_progress':
      this.timeTracking.arrivedAt = now;
      this.timeTracking.startedAt = now;
      if (this.timeTracking.acceptedAt) {
        this.timeTracking.arrivalTime = Math.round((now - this.timeTracking.acceptedAt) / (1000 * 60));
      }
      break;
    case 'completed':
      this.timeTracking.completedAt = now;
      if (this.timeTracking.startedAt) {
        this.timeTracking.serviceTime = Math.round((now - this.timeTracking.startedAt) / (1000 * 60));
      }
      break;
    case 'cancelled':
      this.timeTracking.cancelledAt = now;
      break;
  }
  
  return this.save();
};

// Add message to communication
serviceRequestSchema.methods.addMessage = function(sender, senderModel, message, messageType = 'text') {
  this.messages.push({
    sender: sender,
    senderModel: senderModel,
    message: message,
    messageType: messageType,
    timestamp: new Date()
  });
  return this.save();
};

// Calculate estimated cost
serviceRequestSchema.methods.calculateEstimatedCost = function(mechanic) {
  let cost = 0;
  
  if (mechanic && mechanic.pricing) {
    // Base service fee
    cost += mechanic.pricing.baseFee || 100;
    
    // Travel fee based on distance
    if (this.distance && mechanic.pricing.perKmCharge) {
      cost += this.distance * mechanic.pricing.perKmCharge;
    }
    
    // Emergency charge
    if (this.isEmergency && mechanic.pricing.emergencyMultiplier) {
      cost *= mechanic.pricing.emergencyMultiplier;
    }
    
    // Tax (18% GST)
    const tax = cost * 0.18;
    
    this.pricing = {
      estimatedCost: Math.round(cost + tax),
      breakdown: {
        serviceFee: mechanic.pricing.baseFee || 100,
        travelFee: this.distance ? this.distance * (mechanic.pricing.perKmCharge || 10) : 0,
        emergencyCharge: this.isEmergency ? (cost * ((mechanic.pricing.emergencyMultiplier || 1.5) - 1)) : 0,
        tax: Math.round(tax)
      }
    };
  }
  
  return this.save();
};

// Static Methods - స్టాటిక్ మెథడ్లు

// Find pending requests near location
serviceRequestSchema.statics.findPendingNearLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    status: 'pending',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  }).populate('customer', 'name phone');
};

// Get service statistics
serviceRequestSchema.statics.getStatistics = async function(mechanicId) {
  const matchStage = mechanicId ? { mechanic: mongoose.Types.ObjectId(mechanicId) } : {};
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        completedRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledRequests: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        totalEarnings: { $sum: '$pricing.finalCost' },
        avgRating: { $avg: '$customerRating.rating' },
        avgServiceTime: { $avg: '$timeTracking.serviceTime' }
      }
    }
  ]);
  
  return stats[0] || {};
};

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
