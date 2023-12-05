const express = require('express');
const router = express.Router();
const fs = require('fs');

module.exports = function (io) {
  const productosPath = './data/productos.json';

  router.get('/', (req, res) => {
    try {
      const productos = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
      res.json(productos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener productos.' });
    }
  });

  router.get('/:pid', (req, res) => {
    const productId = req.params.pid;
    try {
      const productos = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
      const product = productos.find((p) => p.id === productId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Producto no encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el producto.' });
    }
  });

    // Agregar un nuevo producto
    router.post('/', (req, res) => {
      try {
        const productos = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
        const newProduct = {
          id: generateProductId(),
          title: req.body.title,
          description: req.body.description,
          code: req.body.code,
          price: req.body.price,
          status: req.body.status || true,
          stock: req.body.stock,
          category: req.body.category,
          thumbnails: req.body.thumbnails || [],
        };
        productos.push(newProduct);
        fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));

        // Enviar actualización a través de WebSocket
        io.emit('updateProducts', productos);

        res.json(newProduct);
      } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto.' });
      }
    });

  router.put('/:pid', (req, res) => {
    const productId = req.params.pid;
    try {
      const productos = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
      const index = productos.findIndex((p) => p.id === productId);
      if (index !== -1) {
        productos[index] = { ...productos[index], ...req.body };
        fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));
        res.json(productos[index]);
      } else {
        res.status(404).json({ error: 'Producto no encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
  });

  router.delete('/:pid', (req, res) => {
    const productId = req.params.pid;
    try {
      let productos = JSON.parse(fs.readFileSync(productosPath, 'utf-8'));
      productos = productos.filter((p) => p.id !== productId);
      fs.writeFileSync(productosPath, JSON.stringify(productos, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
  });

  function generateProductId() {
    return Math.random().toString(36).substr(2, 9);
  }

  module.exports = router;


return router;
};