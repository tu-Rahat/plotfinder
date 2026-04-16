const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const landRoutes = require("./routes/landRoutes");
const buyRequestRoutes = require("./routes/buyRequestRoutes");
const shortlistRoutes = require("./routes/shortlistRoutes");
const placeRoutes = require("./routes/placeRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/chat", chatRoutes);
app.use("/api/lands", landRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/buy-requests", buyRequestRoutes);
app.use("/api/shortlist", shortlistRoutes);
app.use("/api/places", placeRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});