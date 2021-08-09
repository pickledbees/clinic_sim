const statusCode = require("http-status-codes").StatusCodes;
const path = require("path");
const restClient = require("superagent-bluebird-promise");
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PatientsModel = require("./PatientsModel");
const patientsModel = new PatientsModel(io); //patient model will emit events to sockets when modified

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//simulated clinic API constants
const PORT = 3002;
const KIOSK_API_CALLNUMBER = "http://localhost:3001/callNumber";
const VENUE_ID = "STG-180000001W-83338-SEQRSELFTESTSINGLE-SE";
const SECRET = "secretABC";

//serve clinic management portal
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

//submission API for other applications to send data to
app.get("/checkNumber/:number", (req, res) => {
  res.send({ called: patientsModel.hasCalled(req.params.number) });
});

/**
 * NOTE: This is a sim and only validates the input just enough so it will function.
 * Checks for presence of nric only
 */
//submission API for other applications to send data to
app.post("/submit", (req, res) => {
  if (!req.body.nric) {
    res
      .status(statusCode.BAD_REQUEST)
      .jsonp({ message: "missing nric data from patient" });
  }

  const number = patientsModel.addPatient(req.body);
  res.send({ number });
});

//set up client connections
io.on("connection", (socket) => {
  //emit all patient data to new clinic management portal to load
  socket.emit("patients", { patients: patientsModel.getPatients() });

  //clinic management portal calls number, alert kiosk application and update model
  socket.on("call number", async (data) => {
    try {
      //send HTTP request to server
      let response = await restClient
        .post(KIOSK_API_CALLNUMBER)
        .send({ number: data.number, venueId: VENUE_ID, secret: SECRET })
        .promise();

      //only update model if request was a success
      if (response.statusCode === statusCode.OK) {
        patientsModel.callNumber(data.number);
      }
    } catch (e) {
      //for debug
      console.error(`failed to call number ${data.number}, ${e}`);
    }
  });

  //clinic management portal calls number, update model
  socket.on("delete patient", (data) => {
    patientsModel.deletePatient(data.number);
  });
});

server.listen(PORT, () =>
  console.log("clinic system simulation listening on port:", PORT)
);
