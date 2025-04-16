let web3;
let contract;
let userAccount;

const contractAddress = CONTRACT_ADDRESS;

const initWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('MetaMask connected');
            
            // Initialize Web3
            web3 = new Web3(window.ethereum);
            console.log('Web3 initialized');
            
            // Get user account
            const accounts = await web3.eth.getAccounts();
            userAccount = accounts[0];
            console.log('User account:', userAccount);
            
            document.getElementById('wallet-status').textContent = `Connected: ${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;
            
            // Initialize contract
            await initContract();
        } catch (error) {
            console.error("Error initializing Web3:", error);
            alert("Error connecting to MetaMask. Please make sure MetaMask is installed and unlocked.");
        }
    } else {
        console.error('MetaMask not found');
        alert('Please install MetaMask!');
    }
};

const initContract = async () => {
    try {
        const response = await fetch('OrganDonation.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contractJson = await response.json();
        console.log('Contract JSON loaded');
        
        if (!contractJson.abi) {
            throw new Error('Contract ABI not found in JSON file');
        }
        
        contract = new web3.eth.Contract(contractJson.abi, contractAddress);
        console.log('Contract initialized at address:', contractAddress);
        
        // Verify contract is deployed
        const code = await web3.eth.getCode(contractAddress);
        if (code === '0x') {
            throw new Error('No contract deployed at specified address');
        }
        
        await updateStatistics();
    } catch (error) {
        console.error('Error initializing contract:', error);
        alert('Error initializing contract. Please check console for details.');
        throw error;
    }
};

const updateStatistics = async () => {
    if (!contract) {
        console.error('Contract not initialized');
        return;
    }
    
    try {
        const donorCount = await contract.methods.getDonorCount().call();
        const recipientCount = await contract.methods.getRecipientCount().call();
        
        document.getElementById('donor-count').textContent = donorCount;
        document.getElementById('recipient-count').textContent = recipientCount;
        console.log('Statistics updated:', { donors: donorCount, recipients: recipientCount });
    } catch (error) {
        console.error('Error updating statistics:', error);
    }
};

document.getElementById('donor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!contract) {
        alert('Contract not initialized. Please refresh the page and try again.');
        return;
    }
    
    const name = document.getElementById('donor-name').value;
    const bloodGroup = document.getElementById('donor-blood').value;
    const age = parseInt(document.getElementById('donor-age').value);
    const organType = document.getElementById('donor-organ').value;
    const medicalHistory = document.getElementById('donor-medical').value;

    console.log('Attempting to register donor with:', {
        name, bloodGroup, age, organType, medicalHistory
    });

    try {
        const gasEstimate = await contract.methods.registerDonor(
            name, bloodGroup, age, organType, medicalHistory
        ).estimateGas({ from: userAccount });
        
        console.log('Estimated gas:', gasEstimate);

        const result = await contract.methods.registerDonor(
            name, bloodGroup, age, organType, medicalHistory
        ).send({ 
            from: userAccount,
            gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer
        });
        
        console.log('Transaction result:', result);
        alert('Successfully registered as donor!');
        await updateStatistics();
        await refreshRecords();
    } catch (error) {
        console.error('Detailed error registering donor:', error);
        alert(`Error registering donor: ${error.message}`);
    }
});

document.getElementById('recipient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('recipient-name').value;
    const bloodGroup = document.getElementById('recipient-blood').value;
    const age = document.getElementById('recipient-age').value;
    const neededOrgan = document.getElementById('recipient-organ').value;
    const medicalHistory = document.getElementById('recipient-medical').value;
    const isUrgent = document.getElementById('recipient-urgent').checked;

    try {
        await contract.methods.registerRecipient(name, bloodGroup, age, neededOrgan, medicalHistory, isUrgent)
            .send({ from: userAccount });
        alert('Successfully registered as recipient!');
        await updateStatistics();
        await refreshRecords();
    } catch (error) {
        console.error('Error registering recipient:', error);
        alert('Error registering recipient. Please try again.');
    }
});

async function refreshRecords() {
    await refreshDonorRecords();
    await refreshRecipientRecords();
}

async function refreshDonorRecords() {
    if (!contract) {
        console.error('Contract not initialized');
        return;
    }

    try {
        const donorCount = await contract.methods.getDonorCount().call();
        const donorRecordsDiv = document.getElementById('donor-records');
        donorRecordsDiv.innerHTML = '';

        for (let i = 0; i < donorCount; i++) {
            const donorAddress = await contract.methods.donorList(i).call();
            const donor = await contract.methods.donors(donorAddress).call();

            if (donor.isRegistered) {
                const recordHtml = `
                    <div class="list-group-item">
                        <h6>Donor: ${donor.name}</h6>
                        <p class="mb-1">Blood Group: ${donor.bloodGroup}</p>
                        <p class="mb-1">Age: ${donor.age}</p>
                        <p class="mb-1">Organ Type: ${donor.organType}</p>
                        <p class="mb-1">Status: ${donor.isAvailable ? '<span class="text-success">Available</span>' : '<span class="text-danger">Not Available</span>'}</p>
                        <small class="text-muted">Address: ${donor.donorAddress.substring(0, 6)}...${donor.donorAddress.substring(38)}</small>
                    </div>
                `;
                donorRecordsDiv.innerHTML += recordHtml;
            }
        }
    } catch (error) {
        console.error('Error fetching donor records:', error);
    }
}

async function refreshRecipientRecords() {
    if (!contract) {
        console.error('Contract not initialized');
        return;
    }

    try {
        const recipientCount = await contract.methods.getRecipientCount().call();
        const recipientRecordsDiv = document.getElementById('recipient-records');
        recipientRecordsDiv.innerHTML = '';

        for (let i = 0; i < recipientCount; i++) {
            const recipientAddress = await contract.methods.recipientList(i).call();
            const recipient = await contract.methods.recipients(recipientAddress).call();

            if (recipient.isRegistered) {
                const recordHtml = `
                    <div class="list-group-item ${recipient.isUrgent ? 'list-group-item-danger' : ''}">
                        <h6>Recipient: ${recipient.name}</h6>
                        <p class="mb-1">Blood Group: ${recipient.bloodGroup}</p>
                        <p class="mb-1">Age: ${recipient.age}</p>
                        <p class="mb-1">Needed Organ: ${recipient.neededOrgan}</p>
                        <p class="mb-1">Urgency: ${recipient.isUrgent ? '<span class="text-danger">Urgent</span>' : 'Normal'}</p>
                        <small class="text-muted">Address: ${recipient.recipientAddress.substring(0, 6)}...${recipient.recipientAddress.substring(38)}</small>
                    </div>
                `;
                recipientRecordsDiv.innerHTML += recordHtml;
            }
        }
    } catch (error) {
        console.error('Error fetching recipient records:', error);
    }
}

// Initialize when page loads
window.addEventListener('load', async () => {
    await initWeb3();
    await refreshRecords();
});
