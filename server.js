const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

const Product = require('./models/product');
const Cart = require('./models/cart');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 8080;

// Configuración de la conexión a MongoDB
mongoose.connect('mongodb+srv://gonzalodrolando:<password>@coderhouse.opzbd1v.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
  console.log('Conexión exitosa a MongoDB');
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const hbs = exphbs.create({ extname: '.handlebars' });
app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); // Agregar para manejar datos del formulario


// Importa las rutas de productos y carritos
const productsRouter = require('./routes/products')(io, Product, Cart);
const cartsRouter = require('./routes/carts');

// Usa las rutas importadas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.render('home', { productos: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la lista de productos.' });
  }
});

app.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;
  try {
    const cart = await Cart.findById(cartId).populate('products.productId');
    if (cart) {
      res.render('cart', { products: cart.products });
    } else {
      res.status(404).json({ error: 'Carrito no encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el carrito.' });
  }
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

