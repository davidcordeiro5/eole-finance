import Layout from "../../components/Layout";
import { Flex } from "@chakra-ui/layout";
import { Button, Text } from "@chakra-ui/react";
import { useSigner } from "wagmi";
import { caEole, eoleAbi } from "../../constants";
import { ethers } from "ethers";

import { EoleDepositAndxEoleMint, StakeXEole } from "../../components/Cards";

const Stake = () => {
  const { data: signer } = useSigner();

  const callFaucet = async () => {
    if (!signer) return;
    try {
      const eoleContract = new ethers.Contract(caEole, eoleAbi, signer);
      const value = ethers.utils.parseUnits("30000.0", "ether");
      await eoleContract.faucet(value);
    } catch (error) {
      console.log("error from callFaucet", error);
    }
  };

  return (
    <Layout>
      <Text
        mb="32px"
        alignSelf="center"
        bgGradient="linear(to-l, #447e99, #b8dcff)"
        bgClip="text"
        fontSize="6xl"
        fontWeight="extrabold"
      >
        Mint and Stake
      </Text>
      <Flex justifyContent="space-evenly">
        <EoleDepositAndxEoleMint />
        <StakeXEole />
      </Flex>
    </Layout>
  );
};

export default Stake;
