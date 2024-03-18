const express = require("express");
app = express();
port = 3001;

counterValue = 0;
maxValue = 115;
iotID = 'pi00001';
iotName = 'Zählwerk 1';
iotType = 'proximity';
iotUsecase = 'counter';
iotClientConnected = null;
disconnectTimeout = null;

// Serve Static Files
// app.use(express.static("public"));
// app.use("/assets", express.static("public"));

// template view engine
// app.set("view engine", "ejs");

// Set the json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
// const subscriberRouter = require("./routes/subscriber");
// const publisherRouter = require("./routes/publisher");
// const raspberrypi = require("./controllers/raspberrypi");
// const stepper = require("./controllers/stepper");
const counter = require("./controllers/counter");
const status = require("./controllers/status");

app.get("/", (req, res) => {
  res.send("Rasperry pi 4 - IoT device of MÜNCH for Counting");
});

// app.use("/subscriber", subscriberRouter);
// app.use("/publisher", publisherRouter);


