const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    // userId will be used once auth is implemented
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    source: {
      type: String,
      enum: ['salary', 'freelance', 'investment', 'rental', 'gift', 'other'],
      default: 'other',
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: formatted month-year string for grouping
incomeSchema.virtual('monthYear').get(function () {
  return this.date.toISOString().slice(0, 7); // "2026-04"
});

// Compound index for efficient monthly queries
incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
