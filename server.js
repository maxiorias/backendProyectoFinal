const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.json());

const PRODUCTS_FILE = path.join(__dirname, 'productos.json');
const CARTS_FILE = path.join(__dirname, 'carrito.json');


function readJSONFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}


function writeJSONFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}


const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    res.json(products);
});

productsRouter.get('/:pid', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const product = products.find(prod => prod.id === req.params.pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

productsRouter.post('/', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const newProduct = req.body;
    newProduct.id = Date.now().toString();
    products.push(newProduct);
    writeJSONFile(PRODUCTS_FILE, products);
    res.status(201).json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const updatedProduct = req.body;
    const existingProduct = products.find(prod => prod.id === req.params.pid);
    if (existingProduct) {
        Object.assign(existingProduct, updatedProduct);
        writeJSONFile(PRODUCTS_FILE, products);
        res.json(existingProduct);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

productsRouter.delete('/:pid', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const index = products.findIndex(prod => prod.id === req.params.pid);
    if (index !== -1) {
        products.splice(index, 1);
        writeJSONFile(PRODUCTS_FILE, products);
        res.status(204).end();
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.use('/api/products', productsRouter);


const cartsRouter = express.Router();

cartsRouter.post('/', (req, res) => {
    const carts = readJSONFile(CARTS_FILE);
    const newCart = { id: Date.now().toString(), products: [] };
    carts.push(newCart);
    writeJSONFile(CARTS_FILE, carts);
    res.status(201).json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
    const carts = readJSONFile(CARTS_FILE);
    const cart = carts.find(cart => cart.id === req.params.cid);
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ error: 'Cart not found' });
    }
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
    const carts = readJSONFile(CARTS_FILE);
    const cart = carts.find(cart => cart.id === req.params.cid);
    if (cart) {
        const productID = req.params.pid;
        const existingProduct = cart.products.find(prod => prod.product === productID);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.products.push({ product: productID, quantity: 1 });
        }
        writeJSONFile(CARTS_FILE, carts);
        res.status(201).json(cart.products);
    } else {
        res.status(404).json({ error: 'Cart not found' });
    }
});

app.use('/api/carts', cartsRouter);

// inicio del servidor
app.listen(PORT, () => {
    console.log(`El servidor está funcionando en el puerto ${PORT}`);
});