const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loadSchema = new mongoose.Schema({
  loadNumber: {
    type: String,
  },
  skuNumber: {
    type: String,
  },
  loadCost: {
    type: Number,
  },
  palletsCount: {
    type: Number,
  },
  remainingPalletsCount: {
    type: Number,
    default: 0,
  },
  perPalletCost: {
    type: Number,
  },
  category: {
    type: Schema.Types.ObjectId, // Reference to the Category model
    ref: 'Category', // The name of the referenced model
  },
  loadDate: {
    type: Date,
  },
  barcodeImage: {
    type: String,
  },
  isBrand: {
    type: Boolean,
    default: false,
  },
  brands: [
    {
      brandName: {
        type: String,
      },
      palletNumbers: {
        type: String,
      },
      totalPallet: {
        type: Number,
      },
      totalPrice: {
        type: Number,
      },
      skuCode: {
        type: String,
      },
      barcodeImage: {
        type: String,
      },
    },
  ],
});

const Load = mongoose.model("Load", loadSchema);

module.exports = Load;
