// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ResearchNFT is Ownable, ERC1155, ERC1155Burnable {
    using Strings for uint256;

    // Fixed image URL for all NFTs.
    string private constant _standardImage =
        "https://gpbr.infura-ipfs.io/ipfs/bafkreibkta2e54ddqjlrmxmacjvqcpj7w6o3a4oww6ea7hldjazio22c3e";

    // Base URI for metadata.
    string private _baseURI;

    // Mapping from token ID to its current IPFS CID (metadata).
    mapping(uint256 => string) private _tokenMetadata;

    // Mapping from token ID to an array of previous IPFS CIDs (metadata history).
    mapping(uint256 => string[]) private _metadataHistory;

    /**
     * @dev Constructor to initialize the contract with a base URI.
     * The deployer (msg.sender) is set as the initial owner via the Ownable constructor.
     */
    constructor(string memory baseURI)
        ERC1155(baseURI)
        Ownable(msg.sender)
    {
        _setBaseURI(baseURI);
    }

    /**
     * @dev Sets the base URI for all tokens.
     */
    function _setBaseURI(string memory baseURI) internal {
        _baseURI = baseURI;
    }

    /**
     * @dev Returns the base URI for all tokens.
     */
    function uri(uint256 /* tokenId */) public view override returns (string memory) {
        return _baseURI;
    }

    /**
     * @dev Mints `amount` tokens of type `id` to `account` and associates it with an IPFS CID.
     */
    function mint(
        address account,
        uint256 id,
        uint256 amount,
        string memory ipfsURL
    ) public onlyOwner {
        require(bytes(ipfsURL).length > 0, "IPFS URL cannot be empty");

        // Mint the tokens.
        _mint(account, id, amount, "");

        // Store the IPFS CID for the token ID and add it to the history.
        _tokenMetadata[id] = ipfsURL;
        _metadataHistory[id].push(ipfsURL);
    }

    /**
     * @dev Updates the IPFS CID for a given token ID and keeps track of the history.
     */
    function updateTokenMetadata(uint256 id, string memory newIpfsURL) public onlyOwner {
        require(bytes(newIpfsURL).length > 0, "IPFS URL cannot be empty");
        require(bytes(_tokenMetadata[id]).length > 0, "Token ID does not exist");

        // Append the new CID to the history and update the current metadata.
        _metadataHistory[id].push(newIpfsURL);
        _tokenMetadata[id] = newIpfsURL;
    }

    /**
     * @dev Returns the current IPFS CID associated with a given token ID.
     */
    function getTokenMetadata(uint256 id) public view returns (string memory) {
        require(bytes(_tokenMetadata[id]).length > 0, "Token ID does not exist");
        return _tokenMetadata[id];
    }

    /**
     * @dev Returns the full history of IPFS CIDs for a given token ID.
     */
    function getMetadataHistory(uint256 id) public view returns (string[] memory) {
        require(_metadataHistory[id].length > 0, "No history for this token ID");
        return _metadataHistory[id];
    }

    /**
     * @dev Updates the base URI for all tokens.
     */
    function updateBaseURI(string memory newBaseURI) public onlyOwner {
        _setBaseURI(newBaseURI);
    }

    /**
     * @dev Returns the fixed image URL for all tokens.
     */
    function getStandardImage() public pure returns (string memory) {
        return _standardImage;
    }
}
