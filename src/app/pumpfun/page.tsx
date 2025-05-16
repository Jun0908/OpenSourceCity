"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-token", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.mint); // もうtoBase58とか不要！
      } else {
        setResult("Failed to create");
      }
    } catch (err) {
      console.error(err);
      setResult("Error creating token");
    }
    setLoading(false);
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem", gap: "1rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Create Token on Pump.fun</h1>
      <button
        onClick={handleCreate}
        disabled={loading}
        style={{
          padding: "0.5rem 1rem",
          fontSize: "1rem",
          fontWeight: "bold",
          backgroundColor: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "0.375rem",
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Creating..." : "Create Token"}
      </button>
      {result && (
        <p>
          Created Token:{" "}
          <a href={`https://pump.fun/${result}`} style={{ color: "#0070f3", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">
            {result}
          </a>
        </p>
      )}
    </main>
  );
}

