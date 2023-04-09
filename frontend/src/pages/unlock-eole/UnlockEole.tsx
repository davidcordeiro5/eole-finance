import { Text, Flex, useToast, Skeleton } from "@chakra-ui/react";
import { useSigner, useContract, useAccount } from "wagmi";
import { caXEole } from "../../constants/contractAddress";
import { xEoleAbi } from "../../constants/abi";
import Layout from "../../components/Layout";
import UnlockEoleCard from "../../components/Cards/UnlockEoleCard";
import WraningText from "./WraningText";
import { BNToEtherString } from "../../utils/BNToEtherString";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "../../utils/toasts";

const UnlockEole = () => {
  const { data: signer } = useSigner();

  const toast = useToast();

  const [xEoleStaked, setXEoleStaked] = useState<string>("--");
  const [unlockAutorized, setUnlockAutorized] = useState<boolean>(false);
  const [unlockTimeEoleChooded, setUnlockTimeEoleChooded] =
    useState<number>(-1);

  console.log("choce", unlockTimeEoleChooded);
  console.log("unlockAutorized", unlockAutorized);

  const contract = useContract({
    address: caXEole,
    abi: xEoleAbi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!contract) return;
    const waitFunction = async () => {
      await getXEoleStaked();
      await getUnlockEoleAutorize();
      await getUnlockTimeEoleChooded();
    };

    waitFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    if (!contract || !unlockAutorized) return;
    const waitFunction = async () => {
      await getUnlockTimeEoleChooded();
    };

    waitFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, unlockAutorized]);

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
      const unlockAutorized = await contract.getUnlockEoleAutorize();
      setUnlockAutorized(unlockAutorized);
    } catch (error) {
      console.log("getUnlockEoleAutorize error", error);
    }
  };
  // getUnlockTimeEoleChooded
  const getUnlockTimeEoleChooded = async () => {
    if (!unlockAutorized) return;
    try {
      if (!contract) return;
      const choice = await contract.getUnlockTimeEoleChooded();
      setUnlockTimeEoleChooded(choice);
    } catch (error) {
      console.log("getUnlockEoleAutorize error", error);
    }
  };

  const unlockEole = async (unlockTimeChoce: 0 | 1) => {
    if (!contract) return;
    try {
      const tx = await contract.unlockEole(unlockTimeChoce);
      tx.wait();
      successToast(toast, "Unlock Eole success");
    } catch (error) {
      console.log("Unlocking Eole fail", error);
      errorToast(toast, "Unlock Eole success");
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
          onSubmit={async () => await unlockEole(0)}
          amountReceived={Number(xEoleStaked) / 2}
          isDisabled={Number(xEoleStaked) <= 0}
        />
        <UnlockEoleCard
          isDisabled={Number(xEoleStaked) <= 0}
          title="Unlocked in 160 days (6month)"
          buttonLabel="UNLOCK IN 180 DAYS"
          info="With this unlock time (180 days) no slash"
          onSubmit={async () => await unlockEole(1)}
          amountReceived={Number(xEoleStaked)}
        />
      </Flex>
    </Layout>
  );
};

export default UnlockEole;
