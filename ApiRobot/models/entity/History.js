const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: new ObjectId()
  },
  robotId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  totalPieces: {
    type: Number,
    required: false
  },
  palatizedPieces: {
    type: Number,
    required: false,
    default: 0
  },
  completedPallets: {
    type: Number,
    required: false,
    default: 0
  },

  totalExecutionDuration: {
    type: Number,
    required: false
  },
  palatizeExecutionDuration: {
    type: Number,
    required: false,
    default: 0
  },
  timestamp: {
    type: Date,
    required: false,
    default: 0
  },
});

module.exports = mongoose.model('History', HistorySchema);