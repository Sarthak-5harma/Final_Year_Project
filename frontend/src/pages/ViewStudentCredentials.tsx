<html>
<head>
  <title>Student Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers/dist/ethers.min.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .cert { margin: 10px 0; border: 1px solid #ccc; padding: 10px; }
  </style>
</head>
<body>
  <h2>Your Academic Credentials</h2>
  <button onclick="loadCredentials()">Load My Credentials</button>
  <div id="certificates"></div>

  <script>
    const contractAddress = "YOUR_CONTRACT_ADDRESS_HERE";
    const contractABI = [/* Paste ABI here */];

    async function loadCredentials() {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const balance = await contract.balanceOf(address);
      let certHTML = "";

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await contract.tokenURI(tokenId);
        certHTML += `<div class="cert">
          <p><b>Token ID:</b> ${tokenId}</p>
          <p><a href="https://ipfs.io/ipfs/${tokenURI}" target="_blank">View Certificate</a></p>
        </div>`;
      }

      document.getElementById("certificates").innerHTML = certHTML || "No credentials found.";
    }
  </script>
</body>
</html>