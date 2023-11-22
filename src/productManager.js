const fs = require('fs').promises;

class ProductManager {
  constructor() {
    this.filePath = './products/products.json';
  }

  async getAllProducts(limit) {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      let products = JSON.parse(data);
  
      if (limit) {
        products = products.slice(0, limit);
      }
  
      return products;
    } catch (error) {
      console.error('Error reading products file:', error);
      throw new Error('Error reading products file');
    }
  }

  async getProductById(productId) {
    const products = await this.getAllProducts();
    return products.find(product => product.id == productId);
  }
}

module.exports = ProductManager;
