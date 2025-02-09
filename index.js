require('dotenv').config(); // Load environment variables from .env
const fs = require('fs');
const path = require('path');
const { createAttestation } = require('./createAttestation');
const { uploadToIPFS } = require('./uploadToIPFS');
const { mintNFTree } = require('./mintNFTree');

// Function to save attestation data to a JSON file
function saveAttestationToJson(attestationUID, data) {
  const filePath = path.join(__dirname, "attestation.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Attestation saved to ${filePath}`);
}

// Main function to execute the workflow
(async () => {
  try {
    // Step 1: Create the attestation
    console.log("Step 1: Creating attestation...");
    const attestationUID = await createAttestation();
    console.log("Attestation created successfully. UID:", attestationUID);

    // Step 2: Save the attestation data to a JSON file
    console.log("Step 2: Saving attestation data to JSON file...");
    const attestationData = { name: "AttestationUID", value: attestationUID };
    saveAttestationToJson(attestationUID, attestationData);

    // Step 3: Upload the JSON file to IPFS
    console.log("Step 3: Uploading attestation JSON file to IPFS...");
    const filePath = path.join(__dirname, "metadataNFTree");
    const ipfsCID = await uploadToIPFS(filePath);
    console.log("File uploaded to IPFS successfully! CID:", ipfsCID);

    // Step 4: Mint the ERC-1155 NFT
    console.log("Step 4: Minting ERC-1155 NFT...");
    const recipient = process.env.RECIPIENT_ADDRESS;
    const tokenId = 2; // Example token ID
    const amount = 1; // Example amount
    const tokenURI = ipfsCID; // Use the IPFS CID as the token URI

    if (!recipient) {
      throw new Error("RECIPIENT_ADDRESS is not configured in the .env file.");
    }

    const mintReceipt = await mintNFTree(recipient, tokenId, amount, tokenURI);
    console.log("ERC-1155 NFT minted successfully! Transaction details:", mintReceipt);

    console.log("Workflow completed successfully!");
  } catch (error) {
    console.error("Error in main process:", error);
  }
})();