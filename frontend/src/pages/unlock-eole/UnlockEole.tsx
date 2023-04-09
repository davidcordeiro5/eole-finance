import { Text, Flex } from "@chakra-ui/react";
import { useSigner, useContract, useAccount } from "wagmi";
import { caXEole } from "../../constants/contractAddress";
import { xEoleAbi } from "../../constants/abi";
import Layout from "../../components/Layout";
import UnlockEoleCard from "../../components/Cards/UnlockEoleCard";
import WraningText from "./WraningText";
import { BNToEtherString } from "../../utils/BNToEtherString";
import { useEffect, useState } from "react";

const UnlockEole = () => {
  const { data: signer } = useSigner();
  const [xEoleStaked, setXEoleStaked] = useState<string>("--");

  const contract = useContract({
    address: caXEole,
    abi: xEoleAbi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!contract) return;

    const waitFunction = async () => {
      await getXEoleStaked();
    };

    waitFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  // getXEoleStaked;
  const getXEoleStaked = async () => {
    try {
      if (!contract) return;
      const xeDeposit = await contract.getXEoleStaked();
      setXEoleStaked(BNToEtherString(xeDeposit));
    } catch (error) {
      console.log("getXEoleStaked error", error);
    }
  };

  // getUnlockEoleAutorize;
  const getUnlockEoleAutorize = async () => {
    try {
      if (!contract) return;
      const unlockAutorize = await contract.getUnlockEoleAutorize();
      console.log("unlockAutorize", unlockAutorize);
      // setEDeposit(BNToEtherString(eDeposit));
    } catch (error) {
      console.log("getUnlockEoleAutorize error", error);
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
        Unlock Eole deposit
      </Text>
      <WraningText />
      <Flex justifyContent="space-evenly" mt="32px">
        <UnlockEoleCard
          title="Unlocked in 30 days"
          buttonLabel="UNLOCK IN 30 DAYS"
          info="If you unlocked in 30 days, you got slashed 50% your Eole Token's ! The rest will be transferred to the fee vault"
          onSubmit={() => {}}
          amountReceived={Number(xEoleStaked) / 2}
        />
        <UnlockEoleCard
          title="Unlocked in 160 days (6month)"
          buttonLabel="UNLOCK IN 180 DAYS"
          info="With this unlock time (180 days) no slash"
          onSubmit={() => {}}
          amountReceived={Number(xEoleStaked)}
        />
      </Flex>
    </Layout>
  );
};

export default UnlockEole;
