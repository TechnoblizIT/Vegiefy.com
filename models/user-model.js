const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  mobile: String,
  address: [{
    name: String,
    mobile: String,
    pincode: String,
    locality: String,
    address: String,
    city: String,
    state: String,
    landmark: { type: String, default: "" },
    alternatemobile: { type: String, default: "" },
    addressType:{
        type: String,
        default: "Home",
      },
    }],
  googleid: String,
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
      quantity: { type: Number, default: 1 },
    },
  ],
  orders: {
    typeof: Array,
    default: [],
  },
});

module.exports = mongoose.model("User", userSchema);
