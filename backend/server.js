const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const landRoutes = require("./routes/landRoutes");
const buyRequestRoutes = require("./routes/buyRequestRoutes");
const shortlistRoutes = require("./routes/shortlistRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/lands", landRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/buy-requests", buyRequestRoutes);
app.use("/api/shortlist", shortlistRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});