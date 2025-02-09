# Technical Documentation: Tree Attestation and NFT Minting Workflow

**Document Version:** 1.0
**Last Updated:** February 08, 2025
**Author:** Athus Oliveira
## Overview

This documentation outlines a Node.js workflow designed to create on-chain attestations using the Ethereum Attestation Service (EAS), upload associated metadata to IPFS via Pinata, and mint an ERC-1155 NFT representing the attestation.

This workflow is broken down into modular Javascript files for better organization and maintainability. Each file is responsible for a specific part of the process:

**ResearchNFT contract address:** 0x73fee0357b54A98f1b0F2804f7D3d255fAc43E69
**NFTree contract address:** 0x5Ed6240fCC0B2A231887024321Cc9481ba07f3c6

*   **`index.js`**:  The main entry point of the workflow. It orchestrates the entire process, calling functions from other modules sequentially.
*   **`createAttestation.js`**: Handles the creation of an on-chain attestation using the EAS SDK.
*   **`uploadToIPFS.js`**:  Manages the uploading of files to IPFS using the Pinata API.
*   **`mintNFTree.js`**:  Responsible for minting an ERC-1155 NFT using a specified smart contract.

This documentation is intended for developers who want to understand, use, or extend this workflow.

## File Breakdown and Detailed Documentation

### 1. `index.js` - Workflow Orchestration

**Purpose:**

`index.js` serves as the central script that drives the entire NFT attestation and minting process. It defines the sequence of operations, calling functions from other modules to perform each step.

**Workflow Steps:**

1.  **Load Environment Variables:**  Utilizes `dotenv` to load environment variables from a `.env` file. This is crucial for managing sensitive information like API keys, private keys, and contract addresses securely.
2.  **Create Attestation:** Calls the `createAttestation()` function from `createAttestation.js` to generate an on-chain attestation. The unique identifier (UID) of the attestation is returned.
3.  **Save Attestation Data to JSON:**  Saves the Attestation UID to a JSON file named `attestation.json` in the same directory. This step might be for temporary storage or logging purposes.
4.  **Upload Metadata to IPFS:** Invokes the `uploadToIPFS()` function from `uploadToIPFS.js` to upload a file named `metadataNFTree` to IPFS. The function returns the IPFS CID (Content Identifier) which acts as a unique address for the uploaded content on IPFS.
5.  **Mint ERC-1155 NFT:** Calls the `mintNFTree()` function from `mintNFTree.js` to mint an ERC-1155 NFT. This function uses the IPFS CID obtained in the previous step as the Token URI for the NFT, linking the NFT to the metadata stored on IPFS.
6.  **Success/Error Handling:** Implements a `try...catch` block to handle potential errors during the workflow.  Error messages are logged to the console.

**Function: `saveAttestationToJson(attestationUID, data)`**

*   **Purpose:**  Saves attestation data (specifically the UID in this case) to a JSON file.
*   **Parameters:**
    *   `attestationUID` (string): The unique identifier of the attestation.
    *   `data` (object):  An object containing the data to be saved in JSON format. In the current implementation, it's designed to save the `attestationUID` under the key "value" and "name" as "AttestationUID".
*   **Return Value:** None.
*   **Side Effects:** Creates or overwrites the `attestation.json` file in the script's directory.
*   **Example Usage (Internal):**

    ```javascript
    const attestationData = { name: "AttestationUID", value: attestationUID };
    saveAttestationToJson(attestationUID, attestationData);
    ```

**Asynchronous Main Function `(async () => { ... })();`**

*   **Purpose:**  This is an Immediately Invoked Function Expression (IIFE) that executes the main workflow logic asynchronously.  Using `async/await` makes the asynchronous operations (like creating attestations, uploading to IPFS, and minting NFTs) easier to read and manage.
*   **Error Handling:** The entire workflow is wrapped in a `try...catch` block to gracefully handle any errors that might occur during any of the steps. If an error is caught, it is logged to the console.

**Dependencies:**

*   `dotenv`: For loading environment variables from `.env` files.
*   `fs`:  Node.js built-in module for file system operations (used for saving JSON to file).
*   `path`: Node.js built-in module for handling file paths.
*   `./createAttestation`:  Module for creating attestations (relative path).
*   `./uploadToIPFS`: Module for uploading to IPFS (relative path).
*   `./mintNFTree`: Module for minting NFTs (relative path).

**Environment Variables (Required in `.env` file):**

*   `RECIPIENT_ADDRESS`:  The Ethereum address that will receive the minted ERC-1155 NFT.

**Example `.env` configuration (relevant to `index.js`):**

```env
RECIPIENT_ADDRESS=0xYourRecipientEthereumAddressHere
```

---

### 2. `createAttestation.js` - Attestation Creation Module

**Purpose:**

This module is responsible for creating an on-chain attestation using the Ethereum Attestation Service (EAS). It leverages the `@ethereum-attestation-service/eas-sdk` library to interact with the EAS contract.

**Workflow Steps:**

1.  **Load Environment Variables:** Loads necessary environment variables using `dotenv`.
2.  **Import EAS SDK and Dependencies:** Imports required classes and functions from `@ethereum-attestation-service/eas-sdk` and `ethers` libraries.
3.  **Initialize Provider and Signer:**
    *   Creates a `JsonRpcProvider` instance using the `RPC_URL` from environment variables to connect to an Ethereum network.
    *   Creates an `ethers.Wallet` instance using the `PRIVATE_KEY` and the `provider` to represent the account that will sign the attestation transaction.
    *   Retrieves and logs the network chain ID and name for debugging purposes.
4.  **Debug Environment Variables:** Logs the values of key environment variables (`EAS_CONTRACT_ADDRESS`, `SCHEMA_UID`, `RPC_URL`) to the console for debugging.
5.  **Initialize EAS SDK:** Creates an `EAS` instance using the `EAS_CONTRACT_ADDRESS` and connects it with the `signer`.
6.  **Initialize SchemaEncoder:**
    *   Creates a `SchemaEncoder` instance.
    *   Defines the schema for the attestation as a string: `'uint256 researchLogID, address triggerWallet, string scientificName, string speciesUID, string[] speciesURL, string llmModel, string ipfsCID, uint16 numberInsights, uint16 numberCitations'`. This string defines the data fields that will be included in the attestation and their respective data types.
    *   Encodes sample data according to the defined schema using `schemaEncoder.encodeData()`. This data represents an example research log attestation.
7.  **`createAttestation()` Function:**
    *   **Purpose:**  Asynchronously creates an on-chain attestation.
    *   **Parameters:** None (uses pre-defined schema, encoded data, recipient, etc. within the function).
    *   **Return Value:**  A Promise that resolves with the `attestationUID` (string) upon successful attestation creation. Rejects with an error object if attestation fails.
    *   **Functionality:**
        *   Calls `eas.attest()` with the following parameters:
            *   `schema`:  `SCHEMA_UID` (from environment variables) -  Specifies the schema to use for the attestation.
            *   `data`: An object containing attestation details:
                *   `recipient`:  `'0xf703e22985579d53284648Ba4C56735d6B746c2d'` (hardcoded in this example) - The address receiving the attestation.
                *   `expirationTime`: `NO_EXPIRATION` (from EAS SDK) - Sets no expiration for the attestation.
                *   `revocable`: `false` - Makes the attestation non-revocable.
                *   `data`: `encodedData` - The encoded attestation data prepared using `SchemaEncoder`.
        *   Waits for the transaction to be confirmed using `transaction.wait()`.
        *   Extracts and returns the `attestationUID` from the transaction receipt.
        *   Includes error handling to catch and log errors during attestation creation. If an error occurs, it logs the error details and re-throws the error.

**Dependencies:**

*   `dotenv`: For loading environment variables.
*   `@ethereum-attestation-service/eas-sdk`:  EAS SDK for interacting with the EAS contract.
*   `ethers`:  For interacting with Ethereum networks.

**Environment Variables (Required in `.env` file):**

*   `EAS_CONTRACT_ADDRESS`:  Address of the deployed EAS contract on the target network.
*   `PRIVATE_KEY`: Private key of the Ethereum account that will pay for the attestation transaction.
*   `RPC_URL`:  URL of an Ethereum RPC endpoint (e.g., Infura, Alchemy) for the target network.
*   `SCHEMA_UID`:  UID of the schema registered on the EAS contract that defines the structure of the attestation.

**Example `.env` configuration (relevant to `createAttestation.js`):**

```env
EAS_CONTRACT_ADDRESS=0xYourEASContractAddressHere
PRIVATE_KEY=YourPrivateKeyHere
RPC_URL=YourEthereumRPCUrlHere
SCHEMA_UID=0xYourSchemaUIDHere
```

---

### 3. `uploadToIPFS.js` - IPFS Upload Module

**Purpose:**

This module handles uploading files to the InterPlanetary File System (IPFS) using the Pinata API. Pinata is a popular IPFS pinning service that ensures the uploaded data remains available on IPFS.

**Workflow Steps:**

1.  **Load Environment Variables:** Loads Pinata API keys and gateway URL from environment variables using `dotenv`.
2.  **Import Pinata SDK and Dependencies:** Imports the `pinataSDK`, `fs`, and `path` modules.
3.  **Initialize Pinata SDK:** Creates a `pinataSDK` instance using `pinataApiKey` and `pinataSecretApiKey`.
4.  **`uploadToIPFS(filePath)` Function:**
    *   **Purpose:** Asynchronously uploads a file to IPFS using Pinata.
    *   **Parameters:**
        *   `filePath` (string): The full path to the file that needs to be uploaded to IPFS.
    *   **Return Value:** A Promise that resolves with the IPFS CID (Content Identifier) as a string (prefixed with the gateway URL). Rejects with an error object if the upload fails.
    *   **Functionality:**
        *   **API Key Check:** Verifies if `pinataApiKey` and `pinataSecretApiKey` are configured in the environment variables. Throws an error if not.
        *   **File Existence Check:**  Checks if the file specified by `filePath` exists using `fs.existsSync()`. Throws an error if the file is not found.
        *   **Create ReadableStream:** Creates a readable stream from the file using `fs.createReadStream()`. This is efficient for handling potentially large files as it processes data in chunks.
        *   **Define Pinata Options:** Sets options for the Pinata upload:
            *   `pinataMetadata`: Includes metadata for the uploaded file, setting the `name` to the base filename (extracted using `path.basename(filePath)`). Additional metadata can be added here if needed.
            *   `pinataOptions`: Sets `cidVersion` to `0` (optional, version 0 is commonly used).
        *   **Upload to IPFS:**  Calls `pinata.pinFileToIPFS()` to upload the readable stream with the defined options.
        *   **Log Success and CID:** Logs a success message and the `ipfsCID` to the console.
        *   **Return IPFS URL:** Returns the full IPFS URL by concatenating the `gatewayURL` with the `ipfsCID`.
        *   **Error Handling:** Includes a `try...catch` block to handle potential errors during the upload process. If an error occurs, it logs the error and re-throws it.
5.  **`main()` Function (Example Usage/Testing):**
    *   **Purpose:**  Provides an example of how to use the `uploadToIPFS()` function for testing and demonstration.
    *   **Functionality:**
        *   Defines `fileToUploadPath` as `metadataNFTree` in the same directory.
        *   Creates a sample file named `metadataNFTree` with some text content if it doesn't already exist.
        *   Calls `uploadToIPFS()` with `fileToUploadPath`.
        *   Logs the returned CID and handles potential errors.
    *   **Execution Check:**  The `if (require.main === module)` block ensures that the `main()` function is only executed when `uploadToIPFS.js` is run directly (e.g., `node uploadToIPFS.js`) and not when it is imported as a module in another script.

**Dependencies:**

*   `dotenv`: For loading environment variables.
*   `@pinata/sdk`:  Pinata SDK for interacting with the Pinata API.
*   `fs`:  Node.js built-in module for file system operations.
*   `path`: Node.js built-in module for handling file paths.

**Environment Variables (Required in `.env` file):**

*   `PINATA_API_KEY`:  Your Pinata API Key.
*   `PINATA_API_SECRET`: Your Pinata API Secret Key.
*   `PINATA_GATEWAY_URL`:  The base URL for the Pinata IPFS gateway (e.g., `https://gateway.pinata.cloud/ipfs/`).

**Example `.env` configuration (relevant to `uploadToIPFS.js`):**

```env
PINATA_API_KEY=YourPinataApiKeyHere
PINATA_API_SECRET=YourPinataApiSecretKeyHere
PINATA_GATEWAY_URL=https://gateway.pinata.cloud/ipfs/
```

---

### 4. `mintNFTree.js` - ERC-1155 NFT Minting Module

**Purpose:**

This module is responsible for minting ERC-1155 NFTs using a pre-deployed smart contract (`NFTree_CONTRACT_ADDRESS`). It uses the `ethers` library to interact with the smart contract on the Ethereum network.

**Workflow Steps:**

1.  **Load Environment Variables:** Loads environment variables needed for connecting to the Ethereum network and accessing the smart contract.
2.  **Import `ethers`:** Imports the `ethers` library for blockchain interactions.
3.  **Environment Variable Validation:** Checks if `RPC_URL`, `NFTree_CONTRACT_ADDRESS`, and `PRIVATE_KEY` are defined in the environment variables. Throws an error if any are missing, ensuring that the script doesn't run without necessary configuration.
4.  **`NFTree_ABI` (Contract ABI):** Defines the Application Binary Interface (ABI) of the ERC-1155 smart contract. The ABI is a JSON array that describes the contract's functions, events, and constructor, enabling `ethers` to interact with the contract. **Note:** This ABI is provided directly in the code. In a real-world scenario, it's often best to keep the ABI in a separate JSON file or import it from a compiled contract artifact.
5.  **`mintNFTree(to, tokenId, amount, tokenURI)` Function:**
    *   **Purpose:** Asynchronously mints an ERC-1155 NFT.
    *   **Parameters:**
        *   `to` (string): The Ethereum address that will receive the minted NFT.
        *   `tokenId` (number): The ID of the ERC-1155 token to be minted.
        *   `amount` (number): The amount of tokens to mint (for ERC-1155, this can be more than 1).
        *   `tokenURI` (string): The URI (typically an IPFS URL) that points to the metadata associated with this token.
    *   **Return Value:** A Promise that resolves with the transaction receipt (`receipt`) upon successful minting. Rejects with an error object if minting fails.
    *   **Functionality:**
        *   **Initialize Provider and Signer:** Creates a `JsonRpcProvider` and `ethers.Wallet` instance similar to `createAttestation.js`, using `RPC_URL` and `PRIVATE_KEY` from environment variables.
        *   **Connect to ERC-1155 Contract:** Creates an `ethers.Contract` instance:
            *   `NFTree_CONTRACT_ADDRESS`: The address of the deployed ERC-1155 contract.
            *   `NFTree_ABI`: The ABI of the ERC-1155 contract.
            *   `signer`: The signer (wallet) that will pay for and sign the minting transaction.
        *   **Mint NFT:** Calls the `mint()` function of the ERC-1155 contract using `erc1155Contract.mint(to, tokenId, amount, tokenURI)`.
        *   **Wait for Transaction Confirmation:**  Waits for the transaction to be confirmed on the blockchain using `tx.wait()`.
        *   **Log Success and Transaction Details:** Logs a success message and the transaction receipt details to the console.
        *   **Return Transaction Receipt:** Returns the transaction receipt object.
        *   **Error Handling:** Includes a `try...catch` block to handle errors during the minting process, logs the error, and re-throws it.

**Dependencies:**

*   `dotenv`: For loading environment variables.
*   `ethers`: For interacting with Ethereum networks and smart contracts.

**Environment Variables (Required in `.env` file):**

*   `RPC_URL`: URL of an Ethereum RPC endpoint for the target network.
*   `NFTree_CONTRACT_ADDRESS`: Address of the deployed ERC-1155 smart contract.
*   `PRIVATE_KEY`: Private key of the Ethereum account authorized to mint NFTs from the contract.

**Example `.env` configuration (relevant to `mintNFTree.js`):**

```env
RPC_URL=YourEthereumRPCUrlHere
NFTREE_CONTRACT_ADDRESS=0xYourNFTreeContractAddressHere
PRIVATE_KEY=YourPrivateKeyHere
```

## Setup and Prerequisites

Before running this workflow, ensure you have the following prerequisites in place:

1.  **Node.js and npm (Node Package Manager) installed:**  Download and install Node.js from [https://nodejs.org/](https://nodejs.org/). npm is included with Node.js.
2.  **Environment Variables Configuration:**
    *   Create a `.env` file in the root directory of your project.
    *   Populate the `.env` file with the necessary environment variables as detailed in each module's documentation. **Important:**  Never commit your `.env` file to version control, especially if it contains private keys or API secrets. Add `.env` to your `.gitignore` file.
3.  **Install Dependencies:** Navigate to your project directory in the terminal and run the following command to install the required npm packages:

    ```bash
    npm install dotenv @ethereum-attestation-service/eas-sdk ethers @pinata/sdk
    ```

## Running the Workflow

To execute the entire workflow, run the `index.js` script from your terminal:

```bash
node index.js
```

Ensure that your environment variables are correctly configured before running the script.

## Potential Improvements and Considerations

*   **Error Handling and Logging:**  Enhance error handling to be more specific and provide more informative error messages. Implement a more robust logging system (e.g., using a logging library) for better debugging and monitoring.
*   **Configuration Management:** Consider using a more sophisticated configuration management approach instead of just `.env` files, especially for larger projects. Libraries like `config` can provide more structured and flexible configuration options.
*   **Input Validation:** Add input validation to functions to ensure that parameters are of the expected type and format, preventing unexpected errors.
*   **Modularity and Reusability:** Further improve modularity by creating reusable functions or classes for common tasks. Consider designing the modules to be more independent and easily testable.
*   **Security:**
    *   **Private Key Management:**  For production environments, explore more secure ways to manage private keys, such as using hardware wallets, key management services (KMS), or secure enclave environments.  Avoid hardcoding or directly exposing private keys in the code.
    *   **Input Sanitization:** If accepting user inputs, sanitize them properly to prevent potential security vulnerabilities (though not directly applicable in the current provided code, it's a general best practice).
*   **Asynchronous Operations and Parallelism:**  Explore opportunities for parallelizing asynchronous operations (e.g., using `Promise.all` where applicable) to potentially improve workflow execution time.
*   **Testing:** Implement unit tests and integration tests for each module to ensure code correctness and prevent regressions as the code evolves.
*   **Documentation Updates:** Keep this documentation up-to-date as the code is modified or enhanced.

## Target Audience

This documentation is primarily intended for:

*   **Developers** who need to understand the codebase, modify it, or integrate it into other systems.
*   **DevOps Engineers** responsible for deploying and maintaining the workflow.
*   **Technical Team Members** who need a detailed understanding of the system's functionality and architecture.

---