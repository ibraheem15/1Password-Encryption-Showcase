"use client";
import React, { useState, useEffect } from "react";

export default function Home() {
    const [message, setMessage] = useState("");
  return (
    <div className={`text-center`}>
      <h1>Encryption</h1>
      <div className={`text-left`}>
        <h2>Client 1</h2>
        <p>Client 1 Message: </p>
        <form className={`flex`} onSubmit={(e) => e.preventDefault()}>
          <input type="text" className={`ml-3 text-black`} onChange={(e) => setMessage(e.target.value)} />
          <button className={`ml-3 text-black bg-white p-1 rounded-md `}>Encrypt</button>
        </form>
        <p>Client 1 Encrypted Message: </p>

        <h2>Client 2</h2>
        <p>Client 2 Encrypted Message: </p>
        <p>Client 2 Decrypted Message: </p>
      </div>
    </div>
  );
}
