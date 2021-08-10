/**
 * Represents a model of the current patients still awaiting their turn
 * broadcasting to subscribed sockets changes to the model
 */
const LAST_CALLED_BUFFER_LENGTH = 5;

class PatientsModel {
  constructor(io) {
    this._nricToPatient = {};
    this._numberToPatient = {};
    this._number = 0;
    this._io = io;
    this._called = new Set();
    this._lastCalled = [];
  }

  callNumber(number) {
    //only proceed to update records if patient has not been called and is in records
    if (
      number in this._numberToPatient &&
      !this._called.has(parseInt(number))
    ) {
      //edit patient data
      this._numberToPatient[number].called = true;

      //add patient into model
      this._called.add(number);

      //adjust last called
      this._lastCalled.unshift({ number, time: Date.now() });
      if (this._lastCalled.length > 5) this._lastCalled.pop();

      //emit to all clients on model change
      this._io.emit("number called", { number });
    }
  }

  addPatient(patientData) {
    //to maintain idempotency and remove potential duplicates
    if (patientData.nric in this._nricToPatient) {
      return this._nricToPatient[patientData.nric].number;
    }

    //increment number
    this._number++;

    //create new patient record
    const patient = { ...patientData, number: this._number, called: false };

    //add patient to model
    this._numberToPatient[this._number] = patient;
    this._nricToPatient[patientData.nric] = patient;

    //emit to all clients on model change
    this._io.emit("patient added", { patient });

    //return number assigned to patient
    return this._number;
  }

  deletePatient(number) {
    if (!(number in this._numberToPatient)) return;

    const patient = this._numberToPatient[number];

    //remove patient
    delete this._nricToPatient[this._numberToPatient[number].nric];
    delete this._numberToPatient[number];

    //emit to all clients on model change
    this._io.emit("patient deleted", { patient });
  }

  getPatients() {
    return Object.values(this._numberToPatient);
  }

  /**
   * Gets the status of the nric and number
   * @param number
   * @param nric
   * @returns {number} 0: registered and waiting, 1: registered and called, 2: not registered (either completed or not in system yet)
   */
  getStatus(nric, number) {
    if (nric in this._nricToPatient) {
      return this._called.has(parseInt(number)) ? 1 : 0;
    }
    return 2;
  }

  /**
   * Returns an array of { number: number, time: integer } representing the last set of people called
   * @returns {[]}
   */
  getLastCalled() {
    return this._lastCalled;
  }
}

module.exports = PatientsModel;
