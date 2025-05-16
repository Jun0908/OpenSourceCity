"use client";

import { useState } from "react";

export default function MintPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("");

  const handleMint = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];

      setLoading(true);
      setLog("Uploading and Minting...");

      const res = await fetch("/api/mint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "My NFT",
          description: "This is a Solana NFT",
          filename: file.name,
          imageBase64: base64,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setLog(`NFT Created!\nExplorer: ${data.explorerUrl}\nNFT URL: ${data.nftUrl}`);
      } else {
        setLog(`Error: ${data.error}`);
      }
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Mint Your NFT</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-4"
      />

      <button
        onClick={handleMint}
        disabled={loading}
        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>

      <pre className="mt-6 whitespace-pre-wrap text-left">{log}</pre>
    </div>
  );
}

