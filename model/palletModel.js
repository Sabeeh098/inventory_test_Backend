const mongoose = require('mongoose');

const palletSchema = new mongoose.Schema({
  palletName: {
    type: String,
    required: true,
  },
  palletCode: {
    type: String,
    required: true,
  },
  palletAmount: {
    type: String,
    required: true,
  },
  selectedLoad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Load',
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  barcodeSvg: {
    type: String, // Assuming you're storing SVG as a string
  },
});

const Pallet = mongoose.model('Pallet', palletSchema);

module.exports = Pallet;
