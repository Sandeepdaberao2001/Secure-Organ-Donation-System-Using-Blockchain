# Secure Organ Donation Management System

A blockchain-based organ donation management system built using Ethereum, Truffle, and Web3.js.

## Prerequisites

- Node.js (v14 or higher)
- Ganache
- MetaMask browser extension
- Truffle (`npm install -g truffle`)

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Ganache:
   - Open Ganache
   - Create a new workspace
   - Link the truffle-config.js file to the workspace

4. Deploy smart contracts:
   ```bash
   truffle compile
   truffle migrate
   ```

5. Configure MetaMask:
   - Connect MetaMask to Ganache network (usually http://127.0.0.1:7545)
   - Import a Ganache account into MetaMask using the private key

6. Update contract address:
   - After deployment, copy the deployed contract address
   - Paste it in client/app.js (contractAddress variable)

7. Start the application:
   - Open client/index.html in a web browser
   - Ensure MetaMask is connected to the correct network and account

## Features

- Register as an organ donor
- Register as an organ recipient
- Hospital verification system
- Organ matching system
- Real-time statistics
- Secure and transparent blockchain-based records

## Security Considerations

- All transactions are secured by blockchain technology
- Smart contract includes access control
- Hospital verification system prevents unauthorized matches
- Personal data is handled securely

## License

MIT
