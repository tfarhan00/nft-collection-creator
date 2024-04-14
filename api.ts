import axios from "axios";

export const nftStorageApi = axios.create({
  baseURL: "https://api.nft.storage",
  headers: {
    Authorization: `Bearer ${process.env.NFT_STORAGE_API_KEY}`,
  },
});
