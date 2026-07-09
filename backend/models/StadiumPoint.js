const mongoose = require('mongoose');

const StadiumPointSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['gate', 'restroom', 'food'],
    required: true
  },
  x: {
    type: Number,
    required: true
  },
  y: {
    type: Number,
    required: true
  },
  crowdLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  queueSize: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['clear', 'moderate', 'congested', 'critical'],
    default: 'clear'
  },
  accessible: {
    type: Boolean,
    default: true
  },
  description: {
    type: String
  },
  typeIcon: {
    type: String,
    default: 'MapPin'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StadiumPoint', StadiumPointSchema);
