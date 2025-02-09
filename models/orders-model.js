const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  orderid: {
    type: String,
    unique: true,
    default: () => `OD-VO${Date.now()}`
  },
  AddressIndex:{
    type: Number,
    default: 0
  },
  Address: {
    type: String,
    default:""
  }
  ,
  Date: {
    type: Date,
    default: Date.now
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  Products:[{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  TotalPrice: {
    type: Number,
    required: true
  },
  DeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deliveryboys'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Out For Deliverey', "Delivered" ,'Cancelled'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Orders', orderSchema);
