import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createClient } from "wagmi";
import { arbitrumGoerli, hardhat, localhost } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

const ALCHEMY_ID = process.env.NEXT_PUBLIC_ALCHEMY_KEY || "";

const { chains, provider, webSocketProvider } = configureChains(
  [
    arbitrumGoerli,
    hardhat,
    localhost,
    // ...(process.env.NODE_ENV === "development" ? [arbitrumGoerli] : []),
  ],
  [publicProvider(), alchemyProvider({ apiKey: ALCHEMY_ID })]
);

const { connectors } = getDefaultWallets({
  appName: "Eole finance",
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export { chains };
