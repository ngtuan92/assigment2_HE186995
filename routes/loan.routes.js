const express = require("express");
const {
  getAllLoan,
  getLoanById,
  getLoansByMemberId,
  createLoan,
  updateLoan,
  deleteLoan,
} = require("../controllers/loan.controller");

const routes = express.Router();

routes.get("/api/loans", getAllLoan);
routes.get("/api/loans/member/:memberId", getLoansByMemberId);
routes.get("/api/loans/:id", getLoanById);
routes.delete("/api/loans/:id", deleteLoan);


module.exports = routes;
