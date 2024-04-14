import {
  deleteCandyMachine,
  deleteCandyGuard,
  fetchCandyMachine,
} from "@metaplex-foundation/mpl-candy-machine";
import { createUmiInstance } from "./helpers";
import { CONFIG } from "./config";
import { publicKey } from "@metaplex-foundation/umi";

// Deleting candy machine
async function main() {
  const umi = createUmiInstance("devnet");
  const candyMachine = await fetchCandyMachine(
    umi,
    publicKey(CONFIG.candyMachineAddress)
  );
  await deleteCandyMachine(umi, {
    candyMachine: candyMachine.publicKey,
  }).sendAndConfirm(umi);

  await deleteCandyGuard(umi, {
    candyGuard: candyMachine.mintAuthority,
  }).sendAndConfirm(umi);
  console.log("Candy machine has been deleted");
}
main();
