const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const MajorRoute = require("./routes/major.route");
const UniversityRoute = require("./routes/university.route");
const UniversityEntranceExamScoreRoute = require("./routes/universityEntranceExamScore.route");
const UserRoute = require("./routes/user.route");

const app = express();
app.use(compression());
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/major", MajorRoute);
app.use("/api/university", UniversityRoute);
app.use("/api/uees", UniversityEntranceExamScoreRoute);
app.use("/api/user", UserRoute);

const connect = async () => {
  try {
    mongoose
      .connect("mongodb://localhost:27017/", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => console.log("Đã kết nối đến MongoDB"))
      .catch((error) => console.error(error));
  } catch (error) {
    console.log(error);
  }
};

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";

  return res.status(errorStatus).send(errorMessage);
});

app.listen(8800, () => {
  connect();
  console.log("Backend server is running!");
});
