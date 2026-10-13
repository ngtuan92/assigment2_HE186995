const express = require("express");
const {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require("../controllers/member.controller");

const routes = express.Router();

routes.get("/api/members", getAllMembers);
routes.get("/api/members/:id", getMemberById);
routes.post("/api/members", createMember);
routes.put("/api/members/:id", updateMember);
routes.delete("/api/members/:id", deleteMember);


module.exports = routes;
