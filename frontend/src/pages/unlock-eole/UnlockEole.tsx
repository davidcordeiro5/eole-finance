import {
  Text,
  Flex,
  useToast,
  Skeleton,
  Button,
  Box,
  VStack,
} from "@chakra-ui/react";
import { useSigner, useContract, useAccount, useContractEvent } from "wagmi";
import { caEole, caXEole } from "../../constants/contractAddress";
import { xEoleAbi } from "../../constants/abi";
import Layout from "../../components/Layout";
import UnlockEoleCard from "../../components/Cards/UnlockEoleCard";
import WraningText from "./WraningText";
import { BNToEtherString } from "../../utils/BNToEtherString";
import { useEffect, useState } from "react";
import { errorToast, successToast } from "../../utils/toasts";
import useCountdown from "../../hooks/useCountdown";
import bigNumberFormatUnits from "../../utils/bigNumberFormatUnits";

const UnlockEole = () => {
  const { data: signer } = useSigner();

  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);

  const [xEoleStaked, setXEoleStaked] = useState<string>("--");
  const [unlockAutorized, setUnlockAutorized] = useState<boolean>();
  const [unlockTime, setUnlockTime] = useState<number>(0);
  const [unlockTimeEoleChooded, setUnlockTimeEoleChooded] =
    useState<number>(-1);

  const contract = useContract({
    address: caXEole,
    abi: xEoleAbi,
    signerOrProvider: signer,
  });

  const countdown = useCountdown(unlockTime);

  useEffect(() => {
    if (!contract) return;
    const waitFunction = async () => {
      await getXEoleStaked();
      await getUnlockEoleAutorize();
      await getUnlockTimeEoleChooded();
      await getUnlockTime();
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

  useEffect(() => {
    const load =
      unlockTimeEoleChooded === -1 &&
      unlockAutorized === undefined &&
      unlockTime === 0;

    setIsLoading(load);
  }, [unlockTimeEoleChooded, unlockAutorized, unlockTime]);

  useContractEvent({
    address: caXEole,
    abi: xEoleAbi,
    eventName: "UnlockingEole",
    listener(_, time) {
      const value = time as any;
      if (value && bigNumberFormatUnits(value) > 0) {
        setUnlockTime(bigNumberFormatUnits(value));
      }
    },
  });

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

  const getUnlockTime = async () => {
    // if (!unlockAutorized) return;
    try {
      if (!contract) return;
      const unlockTime = await contract.getUnlockTime();
      setUnlockTime(unlockTime.toNumber());
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
        alignItems="center"
      >
        Unlock Eole deposit
      </Text>
      <WraningText />
      {isLoading ? (
        <></>
      ) : (
        <>
          {unlockTime > 0 && unlockTimeEoleChooded > -1 ? (
            <VStack
              borderRadius="md"
              mt="65px"
              alignSelf="center"
              alignItems="center"
              border="1px"
              borderColor="gray.500"
              p="24px"
            >
              <Text fontSize="3xl" as="b">
                Congrat ! your Unlock time as started !
              </Text>
              <Text
                alignSelf="center"
                bgGradient="linear(to-l, #447e99, #b8dcff)"
                bgClip="text"
                fontSize="4xl"
                fontWeight="extrabold"
                alignItems="center"
                as="kbd"
              >
                {countdown}
              </Text>
            </VStack>
          ) : (
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
                title="Unlocked in 180 days (6month)"
                buttonLabel="UNLOCK IN 180 DAYS"
                info="With this unlock time (180 days) no sl^ash"
                onSubmit={async () => await unlockEole(1)}
                amountReceived={Number(xEoleStaked)}
              />
            </Flex>
          )}
        </>
      )}
    </Layout>
  );
};

export default UnlockEole;
