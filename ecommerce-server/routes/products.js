const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const productsFilePath = path.join(__dirname, "../data/productos.json");

// Helper function to read and write products file
const readProductsFile = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

const writeProductsFile = (data) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(data, null, 2));
};

// GET all products with optional limit
router.get("/", (req, res) => {
  const products = readProductsFile();
  const limit = parseInt(req.query.limit, 10);

  if (limit && !isNaN(limit)) {
    return res.json(products.slice(0, limit));
  }

  res.json(products);
});

// GET a product by id
router.get("/:pid", (req, res) => {
  const products = readProductsFile();
  const product = products.find((p) => p.id === req.params.pid);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

// POST a new product
router.post("/", (req, res) => {
  const {
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails = [],
  } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newProduct = {
    id: uuidv4(),
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails,
  };

  const products = readProductsFile();
  products.push(newProduct);
  writeProductsFile(products);

  res.status(201).json(newProduct);
});

// PUT update a product by id
router.put("/:pid", (req, res) => {
  const products = readProductsFile();
  const productIndex = products.findIndex((p) => p.id === req.params.pid);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    id: products[productIndex].id, // Ensure ID is not updated
  };

  products[productIndex] = updatedProduct;
  writeProductsFile(products);

  res.json(updatedProduct);
});

// DELETE a product by id
router.delete("/:pid", (req, res) => {
  let products = readProductsFile();
  const productIndex = products.findIndex((p) => p.id === req.params.pid);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products = products.filter((p) => p.id !== req.params.pid);
  writeProductsFile(products);

  res.status(204).end();
});

module.exports = router;
