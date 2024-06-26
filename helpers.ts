import { RpcConfirmTransactionResult } from "@metaplex-foundation/umi";
import base58 from "bs58";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import fs from "fs";
import { Cluster, clusterApiUrl } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { keypairIdentity } from "@metaplex-foundation/umi";

export const convertUmiTxToLink = (tx: {
  signature: Uint8Array;
  result: RpcConfirmTransactionResult;
}) => {
  return `https://explorer.solana.com/tx/${base58.encode(
    tx.signature
  )}?cluster=devnet`;
};

export const createUmiInstance = (cluster: Cluster = "devnet") => {
  const umi = createUmi(clusterApiUrl(cluster));

  // Import your private key file and parse it. (make sure to have some SOL)
  const wallet = "./my-wallet.json";
  const secretKey = JSON.parse(fs.readFileSync(wallet, "utf-8"));

  // Create a keypair from your private key
  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(secretKey)
  );

  // Register it to the Umi client.
  return umi
    .use(keypairIdentity(keypair))
    .use(mplTokenMetadata())
    .use(mplCandyMachine());
};
