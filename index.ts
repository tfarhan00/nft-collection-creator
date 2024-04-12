import {
  generateSigner,
  percentAmount,
  publicKey,
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

async function main() {
  // 1. Create Umi Instance
  const umi = createUmiInstance();

  // 2. Upload the nft collection metadata here
  // e.g const metadataUri = await nftStorage()
  const nftCollectionMetadataURI = "";

  // 3. Create nft collection nft for grouping NFTs
  const mainCreator = generateSigner(umi);
  const collectionUpdateAuthority = generateSigner(umi);
  const collectionMint = generateSigner(umi);
  const nftTx = await createNft(umi, {
    mint: collectionMint,
    authority: collectionUpdateAuthority,
    name: "Testis NFT",
    uri: nftCollectionMetadataURI,
    sellerFeeBasisPoints: percentAmount(4), // 4%
    isCollection: true,
  }).sendAndConfirm(umi);

  console.log(
    "NFT Succesfully created, here's the tx link: ",
    convertUmiTxToLink(nftTx)
  );

  // 4. Create candy machine
  const candyMachine = generateSigner(umi);
  const candyMachineTx = await create(umi, {
    candyMachine,
    collectionMint: collectionMint.publicKey,
    collectionUpdateAuthority,
    tokenStandard: TokenStandard.NonFungible,
    sellerFeeBasisPoints: percentAmount(4),
    symbol: "TESTIS",
    maxEditionSupply: 0,
    isMutable: true,
    itemsAvailable: 500,
    creators: [
      { address: mainCreator.publicKey, percentageShare: 100, verified: true },
    ],
    configLineSettings: some({
      prefixName: "Testis #$ID+1$",
      nameLength: 0,
      prefixUri: "https://arweave.net/",
      uriLength: 43,
      isSequential: false,
    }),
    /*
     * Setting up guards is important,
     * check it out here https://developers.metaplex.com/candy-machine/guards
     */
    guards: {
      // Make user only can mint with certain amount
      mintLimit: some({ id: 1, limit: 5 }),

      // Make user pay with a custom SPL TOKEN
      tokenPayment: some({
        amount: 300, // e.g 300 PEPE,
        mint: publicKey(CONFIG.splTokenAddress),
        destinationAta: publicKey(
          findAssociatedTokenPda(umi, {
            mint: publicKey(CONFIG.splTokenAddress),
            owner: umi.identity.publicKey,
          }).toString()
        ),
      }),

      // Add other guards
    },
  });

  const candyMachineTxSignature = await candyMachineTx.sendAndConfirm(umi);

  console.log(
    "Candy machine Succesfully created, here's the tx link: ",
    convertUmiTxToLink(candyMachineTxSignature)
  );
}

main();
