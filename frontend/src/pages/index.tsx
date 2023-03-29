import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

import { Account } from "../components/Account";
import Layout from "../components/Layout";

function Page() {
  const { isConnected } = useAccount();
  return (
    <Layout>
      {/* <h1>wagmi + RainbowKit + Next.js</h1> */}

      {/* <ConnectButton /> */}
      {/* {isConnected && <Account />} */}
    </Layout>
  );
}

export default Page;
