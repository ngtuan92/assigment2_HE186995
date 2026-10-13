const express = require("express");
const {
  getAllLoan,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
} = require("../controllers/loan.controller");

const routes = express.Router();

// Routes with /api/loans
routes.get("/api/loans", getAllLoan);
routes.get("/api/loans/:id", getLoanById);
routes.post("/api/loans", createLoan);
routes.put("/api/loans/:id", updateLoan);
routes.delete("/api/loans/:id", deleteLoan);

// Fallback routes with /loans
routes.get("/loans", getAllLoan);
routes.get("/loans/:id", getLoanById);
routes.post("/loans", createLoan);
routes.put("/loans/:id", updateLoan);
routes.delete("/loans/:id", deleteLoan);

module.exports = routes;