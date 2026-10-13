const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dbContext = require("./config/db");

require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", async (req, res) => {
  try {
    res.send({ message: "Welcome to Practical Exam!" });
  } catch (error) {
    res.send({ error: error.message });
  }
});

const bookRoutes = require("./routes/book.routes");
const memberRoutes = require("./routes/member.routes");
const loanRoutes = require("./routes/loan.routes");

app.use(bookRoutes);
app.use(memberRoutes);
app.use(loanRoutes);

const PORT = process.env.PORT || 9999;
const HOSTNAME = process.env.HOSTNAME || "localhost";

app.listen(PORT, async () => {
  await dbContext.connectDB();
  console.log(`Server running at: http://${HOSTNAME}:${PORT}`);
});