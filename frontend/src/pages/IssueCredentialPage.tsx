<html>
<head>
  <title>University Issuer Portal</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers/dist/ethers.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    input, button { padding: 10px; margin: 10px 0; width: 300px; }
  </style>
</head>
<body>
  <h2>Issue Academic Credential</h2>
  <input type="text" id="studentAddress" placeholder="Student Wallet Address" />
  <input type="text" id="ipfsHash" placeholder="IPFS Hash of Certificate" />
  <button onclick="mintCredential()">Mint Credential</button>
  <p id="status"></p>

  <script>
    const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
    const contractABI = [/* Paste ABI here */];

    async function mintCredential() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const student = document.getElementById("studentAddress").value;
      const hash = document.getElementById("ipfsHash").value;

      try {
        const tx = await contract.mintCredential(student, hash);
        document.getElementById("status").innerText = "Transaction sent: " + tx.hash;
        await tx.wait();
        document.getElementById("status").innerText = "Credential issued!";
      } catch (err) {
        document.getElementById("status").innerText = err.message;
      }
    }
  </script>
</body>
</html>