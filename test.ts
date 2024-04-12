import {
  Umi,
  generateSigner,
  publicKey,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import {
  fetchCandyMachine,
  addConfigLines,
  CandyMachine,
  mintV2,
} from "@metaplex-foundation/mpl-candy-machine";
import { convertUmiTxToLink, createUmiInstance } from "./helpers";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { CONFIG } from "./config";

/**
 * WORK IN PROGRESS!!
 */

// Function to implement in browser
async function insertNFTToCollectionAndMint(
  umi: Umi,
  candyMachine: CandyMachine
) {
  const addCollectionTx = await addConfigLines(umi, {
    candyMachine: candyMachine.publicKey,
    index: candyMachine.itemsLoaded,
    configLines: [{ name: "1", uri: "1.json" }],
  }).sendAndConfirm(umi);

  console.log(
    "Collection item succesfully added, here's the tx link: ",
    convertUmiTxToLink(addCollectionTx)
  );

  // The minted nft that is marked as isCollection
  const collectionNft = {} as any;

  const nftMint = generateSigner(umi);
  await transactionBuilder()
    .add(setComputeUnitLimit(umi, { units: 800_000 }))
    .add(
      mintV2(umi, {
        candyMachine: candyMachine.publicKey,
        nftMint,
        collectionMint: collectionNft.publicKey,
        collectionUpdateAuthority: collectionNft.metadata.updateAuthority,
        tokenStandard: candyMachine.tokenStandard,
      })
    )
    .sendAndConfirm(umi);
}

async function main() {
  const umi = createUmiInstance();

  const candyMachine = await fetchCandyMachine(
    umi,
    // Input your own candy machine publicKey that can be found through
    // solana explorer link provided after successful candy machine creation in index.ts
    publicKey(CONFIG.candyMachineAddress)
  );
  console.log("your candy machine: ", candyMachine);

  //   await insertNFTToCollectionAndMint(umi, candyMachine)
}

main();
