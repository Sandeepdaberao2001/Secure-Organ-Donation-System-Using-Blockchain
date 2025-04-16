// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OrganDonation {
    struct Donor {
        address donorAddress;
        string name;
        string bloodGroup;
        uint age;
        bool isRegistered;
        string organType;
        string medicalHistory;
        bool isAvailable;
    }

    struct Recipient {
        address recipientAddress;
        string name;
        string bloodGroup;
        uint age;
        bool isRegistered;
        string neededOrgan;
        string medicalHistory;
        bool isUrgent;
    }

    struct Hospital {
        address hospitalAddress;
        string name;
        bool isVerified;
    }

    mapping(address => Donor) public donors;
    mapping(address => Recipient) public recipients;
    mapping(address => Hospital) public hospitals;
    address[] public donorList;
    address[] public recipientList;
    address public owner;

    event DonorRegistered(address indexed donor, string name, string organType);
    event RecipientRegistered(address indexed recipient, string name, string neededOrgan);
    event HospitalRegistered(address indexed hospital, string name);
    event OrganMatched(address indexed donor, address indexed recipient, string organType);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyHospital() {
        require(hospitals[msg.sender].isVerified, "Only verified hospitals can perform this action");
        _;
    }

    function registerHospital(address _hospitalAddress, string memory _name) public onlyOwner {
        require(!hospitals[_hospitalAddress].isVerified, "Hospital already registered");
        hospitals[_hospitalAddress] = Hospital(_hospitalAddress, _name, true);
        emit HospitalRegistered(_hospitalAddress, _name);
    }

    function registerDonor(
        string memory _name,
        string memory _bloodGroup,
        uint _age,
        string memory _organType,
        string memory _medicalHistory
    ) public {
        require(!donors[msg.sender].isRegistered, "Donor already registered");
        donors[msg.sender] = Donor(
            msg.sender,
            _name,
            _bloodGroup,
            _age,
            true,
            _organType,
            _medicalHistory,
            true
        );
        donorList.push(msg.sender);
        emit DonorRegistered(msg.sender, _name, _organType);
    }

    function registerRecipient(
        string memory _name,
        string memory _bloodGroup,
        uint _age,
        string memory _neededOrgan,
        string memory _medicalHistory,
        bool _isUrgent
    ) public {
        require(!recipients[msg.sender].isRegistered, "Recipient already registered");
        recipients[msg.sender] = Recipient(
            msg.sender,
            _name,
            _bloodGroup,
            _age,
            true,
            _neededOrgan,
            _medicalHistory,
            _isUrgent
        );
        recipientList.push(msg.sender);
        emit RecipientRegistered(msg.sender, _name, _neededOrgan);
    }

    function matchOrgan(address _donor, address _recipient) public onlyHospital {
        require(donors[_donor].isRegistered, "Donor not registered");
        require(recipients[_recipient].isRegistered, "Recipient not registered");
        require(donors[_donor].isAvailable, "Donor not available");
        
        donors[_donor].isAvailable = false;
        emit OrganMatched(_donor, _recipient, donors[_donor].organType);
    }

    function getDonorCount() public view returns (uint) {
        return donorList.length;
    }

    function getRecipientCount() public view returns (uint) {
        return recipientList.length;
    }
}
