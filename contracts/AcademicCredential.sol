// contracts/AcademicCredential.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract AcademicCredential is
    ERC721URIStorage,
    ERC721Enumerable,
    AccessControl
{
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    // Mapping from university address to name, and list of all university addresses
    mapping(address => string) public universityNames;
    address[] private universityAddresses;

    // Mapping from credential tokenId to the issuer (university) address
    mapping(uint256 => address) public credentialIssuer;

    // Mapping from tokenId to certificate title
    mapping(uint256 => string) public certificateTitle;

    //  LOGGED WHENEVER YOU ISSUE A NEW CERTIFICATE
    event CredentialIssued(
        address indexed issuer,
        address indexed to,
        uint256 indexed tokenId,
        string title
    );

    // Counter for token IDs
    uint256 private _tokenIdCounter;

    constructor() ERC721("AcademicCredential", "ACAD") {
        // Grant the deployer the default admin role (controls ISSUER_ROLE granting)
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance.
     * Ensures enumeration and AccessControl interfaces are supported.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Override required by ERC721Enumerable for tracking token indices.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    /**
     * @dev Override required to use ERC721URIStorage (clears token URI on burn).
     * Also cleans up our credentialIssuer mapping on burn.
     */
    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete credentialIssuer[tokenId];
    }

    /**
     * @dev Override to use token URI from ERC721URIStorage.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Admin-only function to register a new University.
     * Grants the ISSUER_ROLE to `uniAddress` and stores its name.
     */
    function addUniversity(
        address uniAddress,
        string memory uniName
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            bytes(universityNames[uniAddress]).length == 0,
            "University already registered"
        );
        grantRole(ISSUER_ROLE, uniAddress);
        universityNames[uniAddress] = uniName;
        universityAddresses.push(uniAddress);
    }

    /**
     * @notice Returns the total number of universities registered.
     */
    function getUniversityCount() public view returns (uint256) {
        return universityAddresses.length;
    }

    /**
     * @notice Returns the university address and name at a given index in the list.
     */
    function getUniversityAtIndex(
        uint256 index
    ) public view returns (address, string memory) {
        require(index < universityAddresses.length, "Index out of bounds");
        address uniAddr = universityAddresses[index];
        return (uniAddr, universityNames[uniAddr]);
    }

    /**
     * @notice Issuer-only function to issue a new credential NFT to a student.
     * Mints a new token to `student` with the given `uri` (IPFS link).
     * @return tokenId of the newly issued credential.
     */
    function issueCredential(
        address student,
        string memory uri,
        string memory title
    ) external onlyRole(ISSUER_ROLE) returns (uint256) {
        _tokenIdCounter += 1;
        uint256 id = _tokenIdCounter;

        _safeMint(student, id);
        _setTokenURI(id, uri);
        credentialIssuer[id] = msg.sender;
        certificateTitle[id] = title;
        emit CredentialIssued(msg.sender, student, _tokenIdCounter, title);
        return id;
    }

    /**
     * @notice Burns (revokes) a credential NFT.
     * Can be called by the contract admin or the issuer of that credential.
     */
    function revokeCredential(uint256 tokenId) public {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) ||
                credentialIssuer[tokenId] == msg.sender,
            "Not authorized to revoke"
        );
        _burn(tokenId);
    }
}
