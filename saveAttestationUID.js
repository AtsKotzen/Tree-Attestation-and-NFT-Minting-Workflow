function saveAttestationUID(attestationUID) {
    const jsonData = {      
      attestationUID: attestationUID,
    };
    let response = JSON.stringify(jsonData, null, 2);
    console.log("CID e UID salvos no arquivo metadata.json");
    return response
  }
  
  module.exports = { saveAttestationUID };