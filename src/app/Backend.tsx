import crypto from "crypto";
import express, { Request, Response } from "express";

const app = express();
const port = 3000;

app.use(express.json());

interface FormData {
  message: string;
}

app.post("/api-encrypt", (req: Request, res: Response) => {
    const { message } = req.body as FormData;

    console.log('Received message:', message);

  // Send a response back to the client
  res.status(200).json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
    }
);

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

const MESSAGE = "Hello World";

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

  console.table({ DecyptedMessage: decrypted });
} catch (error) {
  console.log(error);
}
