const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const cartsFilePath = path.join(__dirname, "../data/carrito.json");
const productsFilePath = path.join(__dirname, "../data/productos.json");

// Helper functions to read and write carts file
const readCartsFile = () => {
  const data = fs.readFileSync(cartsFilePath);
  return JSON.parse(data);
};

const writeCartsFile = (data) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(data, null, 2));
};

// Helper function to read products file
const readProductsFile = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

// POST create a new cart
router.post("/", (req, res) => {
  const newCart = {
    id: uuidv4(),
    products: [],
  };

  const carts = readCartsFile();
  carts.push(newCart);
  writeCartsFile(carts);

  res.status(201).json(newCart);
});

// GET products by cart id
router.get("/:cid", (req, res) => {
  const carts = readCartsFile();
  const cart = carts.find((c) => c.id === req.params.cid);

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  res.json(cart.products);
});

// POST add a product to a cart
router.post("/:cid/product/:pid", (req, res) => {
  const carts = readCartsFile();
  const cart = carts.find((c) => c.id === req.params.cid);

  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }

  const products = readProductsFile();
  const product = products.find((p) => p.id === req.params.pid);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const productInCart = cart.products.find((p) => p.product === req.params.pid);

  if (productInCart) {
    productInCart.quantity += 1;
  } else {
    cart.products.push({ product: req.params.pid, quantity: 1 });
  }

  writeCartsFile(carts);

  res.status(201).json(cart);
});

module.exports = router;
