/**
 * Function to prepoluate patients model with patients
 * @param patientsModel
 */
function prepopulate(patientsModel) {
  const patients = [
    {
      nric: "S3100052A",
      name: "TAN HENG HUAT",
      mobileno: "97399245",
      sex: "FEMALE",
      race: "CHINESE",
      nationality: "SINGAPORE CITIZEN",
      dob: "1998-06-06",
      email: "myinfotesting@gmail.com",
      regadd: "102 PEARL GARDEN #09-128 BEDOK NORTH AVENUE 4 Singapore 460102",
    },
    {
      nric: "S6005051A",
      name: "MR MYINFO A",
      mobileno: "97399245",
      sex: "MALE",
      race: "MALAY",
      nationality: "SINGAPORE CITIZEN",
      dob: "1967-11-13",
      email: "myinfotesting@gmail.com",
      regadd: "288A  #08-367 JURONG EAST STREET 40 Singapore 601288",
    },
    {
      nric: "S7955237B",
      name: "DA DONG BAI",
      mobileno: "93749284",
      sex: "MALE",
      race: "CHINESE",
      nationality: "SINGAPORE CITIZEN",
      dob: "1979",
      email: "myinfo34543@gmail.com",
      regadd: "148 HDB-BUKIT PANJANG #04-101 GANGSA ROAD Singapore 670148",
    },
    {
      nric: "S9640091H",
      name: "XIA YIN CHOW",
      mobileno: "99472910",
      sex: "FEMALE",
      race: "CHINESE",
      nationality: "SINGAPORE CITIZEN",
      dob: "1996-03-01",
      email: "myinfo90282@gmail.com",
      regadd: "148 HDB-BUKIT PANJANG #02-101 GANGSA ROAD Singapore 670148",
    },
    {
      nric: "G1612348Q",
      name: "ALFONSO CRUZ",
      mobileno: "97399245",
      sex: "MALE",
      race: "EURASIAN",
      nationality: "AUSTRALIAN",
      dob: "1992-02-01",
      email: "myinfotesting@gmail.com",
      regadd: "",
    },
  ];

  patients.forEach(patientsModel.addPatient.bind(patientsModel));
}

module.exports = prepopulate;
