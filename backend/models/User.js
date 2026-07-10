/**
 * @file User.js
 * @description Mongoose schema and model for StadiumPulse AI users.
 *
 * Includes:
 *  - Input validation (trim, lowercase, length constraints)
 *  - Compound sparse index for fast email + username lookups
 *  - Virtual `publicProfile` for safe serialisation
 *
 * @module models/User
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters.'],
      maxlength: [30, 'Username cannot exceed 30 characters.'],
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },

    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters.'],
    },

    role: {
      type: String,
      enum: {
        values: ['fan', 'organizer'],
        message: 'Role must be either "fan" or "organizer".',
      },
      default: 'fan',
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
    versionKey: false, // removes __v from documents
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

// Explicit compound index to accelerate the $or duplicate-check query
UserSchema.index({ email: 1, username: 1 });

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------

/**
 * Safe public representation of the user – never exposes the password.
 *
 * @returns {{ id: string, username: string, email: string, role: string }}
 */
UserSchema.virtual('publicProfile').get(function () {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    role: this.role,
  };
});

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

module.exports = mongoose.model('User', UserSchema);
