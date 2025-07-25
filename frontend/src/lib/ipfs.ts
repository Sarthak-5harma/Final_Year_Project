/**
 * src/lib/ipfs.ts
 * ---------------
 * Browser‑side helper that uploads (pins) a PDF to Pinata
 * and returns an IPFS URI (`ipfs://<CID>`).
 *
 * Requirements
 *   • Set VITE_PINATA_JWT in frontend/.env
 *   • No extra npm packages needed (uses fetch/FormData)
 */

/* ------------------------------------------------------------------ */
/* 1.  Your Pinata JWT – read from Vite env (vite dev / build)        */
/* ------------------------------------------------------------------ */
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
if (!PINATA_JWT) {
  // Fail fast – it’s better than uploading without auth
  throw new Error(
    'Missing VITE_PINATA_JWT in your environment (frontend/.env)'
  );
}

/* ------------------------------------------------------------------ */
/* 2.  pinPDF(file) – returns ipfs://CID                              */
/* ------------------------------------------------------------------ */
export async function pinPDF(file: File): Promise<string> {
  // ---------- Build multipart/form‑data ----------
  const data = new FormData();
  data.append('file', file, file.name);

  // Optional: add some pin metadata (totally optional)
  data.append(
    'pinataMetadata',
    JSON.stringify({ name: file.name, keyvalues: { ts: Date.now() } })
  );

  // ---------- POST to Pinata ----------
  const res = await fetch(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: data,
    }
  );

  if (!res.ok) {
    // Surface the full error message for easier debugging
    const txt = await res.text();
    throw new Error(`Pinata upload failed (${res.status}): ${txt}`);
  }

  const json: { IpfsHash: string } = await res.json();
  /* Example response:
     {
       "IpfsHash": "Qm…",
       "PinSize": 12345,
       "Timestamp": "2025-07-23T18:00:00Z"
     }
  */

  // Return a URI that your contract/frontend understand.
  return `ipfs://${json.IpfsHash}`;
}
