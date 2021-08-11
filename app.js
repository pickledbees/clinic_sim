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

//simulated clinic API constants
const PORT = process.env.PORT || 3002;
const CLINCQ_API_CALLNUMBER = process.env.API_URL_CALLNUMBER;
const VENUE_ID = process.env.VENUE_ID;
const SECRET = process.env.SECRET;
const LAST_CALLED_BUFFER_LENGTH = process.env.LAST_CALLED_BUFFER_LENGTH || 5;

const prepopulate = require("./prepopulate");
const PatientsModel = require("./PatientsModel");
const patientsModel = new PatientsModel(io, LAST_CALLED_BUFFER_LENGTH); //patient model will emit events to sockets when modified
prepopulate(patientsModel);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//serve clinic management portal
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

//status check API for other applications to query about patient status
app.get("/checkStatus/:nric/:number", (req, res) => {
  const { nric, number } = req.params;
  if (!nric || number === "" || number === undefined) {
    return res.status(statusCode.BAD_REQUEST).jsonp({
      message: "invalid nric or queue number",
    });
  }

  const status = patientsModel.getStatus(nric, number);
  const lastCalled = patientsModel.getLastCalled();

  res.send({ status, lastCalled });
});

//submission API for other applications to send data to
app.post("/submit", (req, res) => {
  //simple validation
  if (!req.body.nric) {
    return res
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
      patientsModel.callNumber(data.number);

      //send HTTP request to server
      let response = await restClient
        .post(CLINCQ_API_CALLNUMBER)
        .send({
          number: data.number,
          venueId: VENUE_ID,
          secret: SECRET,
          lastCalled: patientsModel.getLastCalled(),
        })
        .promise();
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
  console.log("clinic system simulation listening on port", PORT)
);
