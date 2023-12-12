const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const hbs = exphbs.create({ extname: '.handlebars' });

app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

const productsRouter = require('./routes/products')(io);
const cartsRouter = require('./routes/carts');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

io.on('connection', (socket) => {
  console.log('Usuario conectado');
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
