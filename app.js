const express = require("express");
const app = express();
const port = 3000;

// Serve Static Files
app.use(express.static("public"));
app.use("/assets", express.static("public"));

// template view engine
app.set("view engine", "ejs");

// Set the json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
const subscriberRouter = require("./routes/subscriber");
const publisherRouter = require("./routes/publisher");
const raspberrypi = require("./controllers/raspberrypi");
const stepper = require("./controllers/stepper");
const counter = require("./controllers/counter");
const status = require("./controllers/status");

app.get("/", (req, res) => {
  res.send("Rasperry pi 4 - First IoT device of MÜNCH");
});

app.use("/subscriber", subscriberRouter);
app.use("/publisher", publisherRouter);

counterValue = 0;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
