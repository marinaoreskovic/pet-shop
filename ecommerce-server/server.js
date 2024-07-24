const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const path = require("path");
const handlebars = require("express-handlebars");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.engine(
  "handlebars",
  handlebars.engine({
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
  })
);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let products = [];

// Rutas
app.get("/", (req, res) => {
  res.render("home", { products });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { products });
});

// WebSocket
io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.emit("updateProducts", products);

  socket.on("addProduct", (product) => {
    products.push(product);
    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", (productId) => {
    products = products.filter((product) => product.id !== productId);
    io.emit("updateProducts", products);
  });
});

server.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});
