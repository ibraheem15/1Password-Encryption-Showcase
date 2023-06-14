"use client";
import React, { useState, useEffect, use } from "react";
import crypto from "crypto";

export default function Home() {
  const [message, setMessage] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [decrypted, setDecrypted] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const client1 = crypto.createECDH("secp256k1");
    client1.generateKeys();

    const client2 = crypto.createECDH("secp256k1");
    client2.generateKeys();

    const client1PublicKeyBase64 = client1.getPublicKey().toString("base64");
    const client2PublicKeyBase64 = client2.getPublicKey().toString("base64");

    const client1SharedKey = client1.computeSecret(
      client2PublicKeyBase64,
      "base64",
      "hex"
    );
    const client2SharedKey = client2.computeSecret(
      client1PublicKeyBase64,
      "base64",
      "hex"
    );

    // console.log(client1SharedKey === client2SharedKey);
    // console.log('client1 shared Key: ', client1SharedKey);
    // console.log('client2 shared Key: ', client2SharedKey);

    // const MESSAGE = "Hello World";
    //get message from form input
    const MESSAGE = e.currentTarget.messageinput.value;
    setMessage(MESSAGE);

    const IV = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(client1SharedKey, "hex"),
      IV
    );

    let encrypted = cipher.update(MESSAGE, "utf8", "hex");
    encrypted += cipher.final("hex");

    const auth_tag = cipher.getAuthTag().toString("hex");

    console.table({
      IV: IV.toString("hex"),
      encrypted: encrypted,
      auth_tag: auth_tag,
    });

    const payload = IV.toString("hex") + encrypted + auth_tag;

    const payload64 = Buffer.from(payload, "hex").toString("base64");
    console.log(payload64);
    setEncrypted(payload64);

    //Decryption
    const client2_payload = Buffer.from(payload64, "base64").toString("hex");

    const client2_iv = client2_payload.slice(0, 32);
    const client2_encrypted = client2_payload.slice(32, -32);
    const client2_auth_tag = client2_payload.slice(-32);

    console.table({ client2_iv, client2_encrypted, client2_auth_tag });

    try {
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        Buffer.from(client2SharedKey, "hex"),
        Buffer.from(client2_iv, "hex")
      );

      decipher.setAuthTag(Buffer.from(client2_auth_tag, "hex"));

      let decrypted = decipher.update(client2_encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      setDecrypted(decrypted);
      console.table({ DecyptedMessage: decrypted });
    } catch (error) {
      console.log(error);
    }

    // try {
    //   const res = await fetch("/api-encrypt", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       message,
    //     }),
    //   });
    //   const data = await res.json();
    //   console.log(data);
    //   if (res.ok) {
    //     // Request successful, handle the response
    //     console.log("Form data sent successfully!");
    //   } else {
    //     // Request failed, handle the error
    //     console.error("Error sending form data.");
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  };
  return (
    <div
      className={` p-6 max-w-4xl max-sm:mt-0 max-sm:mb-0 max-sm:relative bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 top-0 bottom-0 left-0 right-0 m-auto mt-10 mb-10 text-center  `}
    >
      <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-5xl dark:text-white">
        Encryption and Decryption
      </h1>
      <p className="mb-6 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 dark:text-gray-400">
        This encryption uses AES-256-GCM and ECDH which is a key agreement
        protocol that allows two parties, each having an elliptic-curve
        public-private key pair, to establish a shared secret over an insecure
        channel.
        <b></b>
        It is also used in Bitcoin to generate your wallet address and private
        key as well as 1Password to generate your master password.
      </p>
      <div className=" max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-500 dark:border-gray-700 top-0 bottom-0 left-0 right-0 m-auto">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white left-24">
          Client 1
        </h5>
        <form className={``} method="post" onSubmit={handleSubmit}>
          <div className="flex">
            <input
              type="search"
              id="search"
              name="messageinput"
              className="block w-full p-4 m-1 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Encrypted Message"
              required
            />
            <button
              type="submit"
              className="text-white m-1 right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Encrypt
            </button>
          </div>
        </form>
        <p className="font-normal text-gray-700 dark:text-gray-300 break-words">
          Client 1 Encrypted Message:
          <span className="font-bold dark:text-white"> {encrypted}</span>
        </p>
      </div>
      <div className=" max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-500 dark:border-gray-700 top-0 bottom-0 left-0 right-0 m-auto mt-3">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white left-24">
          Client 2
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-300 break-words">
          Client 2 Received Encrypted Message: {encrypted}
        </p>
        <p className="font-normal text-gray-700 dark:text-gray-300 break-words">
          Client 2 Decrypted Message:{" "}
          <span className="font-bold dark:text-white">{decrypted}</span>
        </p>
      </div>
    </div>
  );
}
