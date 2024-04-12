1. Create a new solana wallet with solana-cli https://docs.solanalabs.com/cli/install

```
solana-keygen new --outfile my-wallet.json
```

2. Adjust the candy machine settings as you intended in `index.ts`

3. Run the NFT collection account creation & token minting and candy machine account with `npm run start or ts-node index`

4. Test if candy machine is correct by using `test.ts` file
