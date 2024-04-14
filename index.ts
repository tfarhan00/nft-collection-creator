import "./dotenv";

import {
  generateSigner,
  percentAmount,
  publicKey,
  sol,
  some,
} from "@metaplex-foundation/umi";
import {
  TokenStandard,
  createNft,
} from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import { convertUmiTxToLink, createUmiInstance } from "./helpers";
import { findAssociatedTokenPda } from "@metaplex-foundation/mpl-toolbox";
import { CONFIG } from "./config";
import { nftStorageApi } from "./api";
import fs from "fs";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

async function main() {
  console.log("Process started...");
  // 1. Create Umi Instance
  const umi = createUmiInstance("devnet");

  // 2. Upload the nft collection metadata here
  console.log("Uploading metadata...");
  const metadataCollection = {
    name: "Blossom Minty",
    symbol: "BLSMTY",
    description: "Bloom like a motherfucker",
    image:
      "https://bafkreicbxpl6otppy46ybzgkk46n6lvrxlb5my5prrwzfkv5dw7x3ilckm.ipfs.nftstorage.link",
    animation_url: null,
    external_url: "https://blossominty.com",
    properties: {
      category: "image",
    },
  };

  // You can use any off-chain or on-chain storage tho
  const metadataUploadedCID = await nftStorageApi.post(
    "/upload",
    metadataCollection
  );

  const nftCollectionMetadataURI = `https://${metadataUploadedCID.data?.value?.cid}.ipfs.nftstorage.link`;

  // 3. Create nft collection nft for grouping NFTs
  const collectionMint = generateSigner(umi);
  const nftTx = await createNft(umi, {
    mint: collectionMint,
    authority: umi.identity,
    name: "Blossom Minty",
    symbol: "BLMTY",
    uri: nftCollectionMetadataURI,
    sellerFeeBasisPoints: percentAmount(4), // 4%
    isCollection: true,
  }).sendAndConfirm(umi);

  console.log(
    "NFT for collection Succesfully created, here's the tx link: ",
    convertUmiTxToLink(nftTx)
  );

  // // 4. Create candy machine
  console.log("Creating candy machine...");
  const candyMachine = generateSigner(umi);
  const candyMachineTx = await create(umi, {
    candyMachine,
    collectionMint: collectionMint.publicKey, // this point to collection NFT which will become the master edition
    collectionUpdateAuthority: umi.identity,
    tokenStandard: TokenStandard.NonFungible,
    sellerFeeBasisPoints: percentAmount(4),
    symbol: "BLSMTY",
    maxEditionSupply: 0,
    isMutable: true,
    itemsAvailable: 1000,
    creators: [
      { address: umi.identity.publicKey, percentageShare: 100, verified: true },
    ],
    configLineSettings: some({
      prefixName: "Blossom Minty #$ID+1$", // You can leave this blank if you want to insert dynamic name
      nameLength: 0,
      prefixUri: "", // Leave this blank since we want to define it later in the apps
      uriLength: 200,
      isSequential: false,
    }),
    /*
     * Setting up guards is important,
     * check it out here https://developers.metaplex.com/candy-machine/guards
     */
    guards: {
      mintLimit: some({ id: 1, limit: 3 }),

      tokenPayment: some({
        amount: 5000, // e.g 300 PEPE,
        mint: publicKey(CONFIG.splTokenAddress),
        destinationAta: findAssociatedTokenPda(umi, {
          mint: publicKey(CONFIG.splTokenAddress),
          owner: umi.identity.publicKey,
        }) as any,
      }),
      // solPayment: some({
      //   lamports: sol(0.5),
      //   destination: umi.identity.publicKey,
      // }),
    },
  });

  const candyMachineTxSignature = await candyMachineTx.sendAndConfirm(umi);

  console.log(
    "Candy machine Succesfully created, here's the tx link: ",
    convertUmiTxToLink(candyMachineTxSignature)
  );

  fs.writeFileSync(
    "candy-machine.txt",
    `Candy Machine Address: ${candyMachine.publicKey}`
  );

  console.log(
    "Your candy machine address has been written to candy-machine.txt, use it in your Dapp"
  );
}

main();
