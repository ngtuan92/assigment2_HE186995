const express = require("express");
const {
  getAllBook,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/book.controller");

const routes = express.Router();

routes.get("/api/books", getAllBook);
routes.get("/api/books/:id", getBookById);
routes.post("/api/books", createBook);
routes.put("/api/books/:id", updateBook);
routes.delete("/api/books/:id", deleteBook);

module.exports = routes;