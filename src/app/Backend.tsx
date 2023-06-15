import crypto from "crypto";
import express, { Request, Response } from "express";

const app = express();
const port = 3001;

app.use(express.json());

interface FormData {
  message: string;
}

var Message = "Hello World";
var Encrypted = "Encrypted Message";
var Decrypted = "Decrypted Message";

// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
app.post("/", (req: Request, res: Response) => {
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
  const MESSAGE = req.body.search;
  Message = MESSAGE;
  console.log("Message: ", Message);
  // setMessage(MESSAGE);

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
  // setEncrypted(payload64);
  Encrypted = payload64;
  console.log("Encrypted: ", Encrypted);

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

    // setDecrypted(decrypted);
    Decrypted = decrypted;
    console.table({ DecyptedMessage: decrypted });
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
});

app.get("/encrypt", (req: Request, res: Response) => {
  res.send("Hello World!");
});
