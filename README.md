1. Create a new solana wallet with solana-cli https://docs.solanalabs.com/cli/install

   ```
   solana-keygen new --outfile my-wallet.json
   ```

   or you can just use your own private key by making a `my-wallet.json` file and import the private key there

2. Adjust the candy machine settings as you intended in `index.ts`

3. Run the NFT collection account creation & token minting and candy machine account with `npm run start or ts-node index`

4. Check your succesfully created candy machine address in generated `candy-machine.txt` and use it in your dApp

5. Test if your candy machine is working by using `test.ts` file
