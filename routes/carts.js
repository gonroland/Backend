const express = require('express');
const router = express.Router();
const fs = require('fs');

const carritoPath = './data/carrito.json';

// Crear un nuevo carrito
router.post('/', (req, res) => {
  try {
    const carritos = JSON.parse(fs.readFileSync(carritoPath, 'utf-8'));
    const newCart = {
      id: generateCartId(),
      products: [],
    };
    carritos.push(newCart);
    fs.writeFileSync(carritoPath, JSON.stringify(carritos, null, 2));
    res.json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito.' });
  }
});

// Obtener productos en un carrito por ID
router.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  try {
    const carritos = JSON.parse(fs.readFileSync(carritoPath, 'utf-8'));
    const cart = carritos.find((c) => c.id === cartId);
    if (cart) {
      res.json(cart.products);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos del carrito.' });
  }
});

// Agregar un producto a un carrito por ID
router.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  try {
    let carritos = JSON.parse(fs.readFileSync(carritoPath, 'utf-8'));
    const cartIndex = carritos.findIndex((c) => c.id === cartId);
    const productIndex = carritos[cartIndex].products.findIndex((p) => p.id === productId);

    if (productIndex !== -1) {
      
      carritos[cartIndex].products[productIndex].quantity += 1;
    } else {
      
      carritos[cartIndex].products.push({ id: productId, quantity: 1 });
    }

    fs.writeFileSync(carritoPath, JSON.stringify(carritos, null, 2));
    res.json(carritos[cartIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el producto al carrito.' });
  }
});

// Función para generar un ID único para un carrito
function generateCartId() {
  return Math.random().toString(36).substr(2, 9);
}

module.exports = router;
