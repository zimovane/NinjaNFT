import { WalletClient } from "@martiandao/aptos-web3-bip44.js";
import axios from "axios";
import { useEffect, useState } from "react";
import { Item } from "../interfaces";
import { setIPFSGateway } from "../utils/nftstorage";

const walletClient = new WalletClient(
  process.env.APTOS_NODE_URL,
  process.env.APTOS_FAUCET_URL
);

async function fillAuctionItem(data: any): Promise<Item> {
  const meta = (await axios.get(setIPFSGateway(data.uri))).data;
  const item: Item = {
    id: data._id,
    collection: data.collection,
    creator: data.creator,
    description: data.description,
    isListing: data.isListing,
    name: data.name,
    price: data.price,
    seller: data.seller,
    type: "FixedPriceSale",
    image: setIPFSGateway(meta.image),
    uri: setIPFSGateway(data.uri),
  };
  return item;
}

export function useAptosWallet() {
  const [address, setAddress] = useState("");
  useEffect(() => {
    const connectAptosWallet = async () => {
      const { address } = await (window as any).martian.connect();
      if (address) {
        setAddress(address);
      }
    };
    connectAptosWallet();
  }, []);
  return { address };
}

export function useAptosGetListedTokens() {
  const [listedTokens, updateListedTokens] = useState<Item[]>([]);
  const [loaded, updateLoaded] = useState(false);
  useEffect(() => {
    const req = async () => {
      const response = await fetch("/api/aptos", {
        method: "GET",
      });
      const items = await Promise.all(
        (await response.json()).map(async (i: any) => await fillAuctionItem(i))
      );
      updateListedTokens(items);
      updateLoaded(true);
    };
    req();
  }, []);
  return { listedTokens, loaded };
}

export function useAptosGetTokens(address: string) {
  const [NFTs, setNFTs] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const getTokens = async () => {
      const tokenIds = await walletClient.getTokenIds(address, 100, 0);
      const tokens = await Promise.all(
        tokenIds.map(async (i) => {
          const token = await walletClient.getToken(i.data);
          token.creator = i.data.token_data_id.creator;
          return token;
        })
      );
      const items = await Promise.all(
        tokens.map(async (i) => {
          const meta = (await axios.get(setIPFSGateway(i.uri))).data;
          const item: Item = {
            isListing: false,
            name: i.name.toString(),
            collection: i.collection.toString(),
            description: meta.description,
            image: setIPFSGateway(meta.image),
            uri: i.uri,
            creator: i.creator,
          };
          return item;
        })
      );
      setLoaded(true);
      setNFTs(items);
    };
    if (address) {
      getTokens();
    }
  }, [address]);
  return { NFTs, loaded };
}
