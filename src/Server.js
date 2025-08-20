require("dotenv").config({
  path: `${__dirname}/../.env`,
});

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const { pool } = require("./DB/pool");
const userRoutes = require("./routes/userRoutes");
const customerRoutes = require("./routes/customerRoutes");

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());

// Middleware to parse JSON bodies
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
    parameterLimit: 10000,
  })
);

app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/users", userRoutes);
app.use("/customers", customerRoutes);
// Database connection check
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Connected to MySQL database!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  });

const APP_PORT = process.env.APP_PORT;
app.listen(APP_PORT, () => {
  console.warn(
    `Application started and listening on http://localhost:${APP_PORT}`
  );
});
