const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// Crear un carrito
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({
      products: [],
    });

    await newCart.save();
    res.json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito.' });
  }
});

// Obtener todos los productos de un carrito
router.get('/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await Cart.findById(cartId).populate('products.id');
    if (cart) {
      // Devolver un objeto estructurado con información sobre el carrito
      res.json({
        cartId: cart._id,
        products: cart.products,
        totalPrice: cart.totalPrice, // Puedes ajustar según tus necesidades
        createdAt: cart.createdAt, // Puedes ajustar según tus necesidades
      });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos del carrito.' });
  }
});

// Agregar un producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  try {
    const cart = await Cart.findById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' });
    }

    const existingProduct = cart.products.find((p) => p.id.toString() === productId);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }

      cart.products.push({ id: product, quantity: 1 });
    }

    // Actualizar el precio total del carrito
    cart.totalPrice += product.price;

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
  }
});

module.exports = router;
