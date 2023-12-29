const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencia a un modelo de usuario si tienes autenticación de usuarios
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product', // Referencia al modelo de productos
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  const Cart = mongoose.model('Cart', cartSchema);
  
  module.exports = Cart;
  