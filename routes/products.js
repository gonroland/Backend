const express = require('express');
const router = express.Router();
const Product = require('../models/product');

module.exports = function (io) {
  router.get('/', async (req, res) => {
    try {
      const { limit = 10, page = 1, sort, query, category, availability } = req.query;
      const skip = (page - 1) * limit;
  
      const filter = {};
      if (category) {
        filter.category = category;
      }
      if (availability !== undefined) {
        filter.status = availability === 'true';
      }
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ];
      }
  
      const products = await Product.find(filter)
        .sort(sort ? { price: sort === 'asc' ? 1 : -1 } : {})
        .limit(Number(limit))
        .skip(skip)
        .exec();
  
      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);
  
      const response = {
        status: 'success',
        payload: products,
        totalPages,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        page: Number(page),
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
        prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}` : null,
        nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}` : null,
      };
  
      res.json(response);
    } catch (error) {
      res.status(500).json({ status: 'error', error: 'Error al obtener productos.' });
    }
  });

  router.get('/:pid', async (req, res) => {
    try {
      const product = await Product.findOne({ id: req.params.pid });
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ error: 'Producto no encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el producto.' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const newProduct = new Product({
        title: req.body.title,
        description: req.body.description,
        code: req.body.code,
        price: req.body.price,
        status: req.body.status || true,
        stock: req.body.stock,
        category: req.body.category,
        thumbnails: req.body.thumbnails || [],
      });

      await newProduct.save();

      // Enviar actualización a través de WebSocket
      io.emit('updateProducts', newProduct);

      res.json(newProduct);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar el producto.' });
    }
  });

  router.put('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { ...req.body },
        { new: true }
      );

      if (updatedProduct) {
        io.emit('updateProducts', updatedProduct);
        res.json(updatedProduct);
      } else {
        res.status(404).json({ error: 'Producto no encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
  });

  router.delete('/:pid', async (req, res) => {
    const productId = req.params.pid;
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);
      if (deletedProduct) {
        io.emit('updateProducts', { action: 'delete', product: deletedProduct });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Producto no encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
  });

  return router;
};
