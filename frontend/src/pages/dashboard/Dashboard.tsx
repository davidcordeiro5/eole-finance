import Image from "next/image";
import {
  EoleTokenImage,
  XEoleTokenImage,
  EUsdcImage,
  EVlpImage,
} from "../../assets/images";
import {
  Box,
  Button,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import Layout from "../../components/Layout";
import { FC, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useContract,
  useContractEvent,
  useProvider,
  useSigner,
} from "wagmi";
import { caEole, caXEole } from "../../constants/contractAddress";
import { xEoleAbi } from "../../constants/abi";
import { BNToEtherString } from "../../utils/BNToEtherString";
import { successToast, errorToast } from "../../utils/toasts";
import { numberFixed } from "../../utils/numberFixed";

const Dashboard = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const toast = useToast();

  const [eDeposit, setEDeposit] = useState<string>("--");
  const [xEEarned, setXEEarned] = useState<string>("--");
  const [xEoleStaked, setXEoleStaked] = useState<string>("--");
  const [unlockedTokenEarned, setUnlockedTokenEarned] = useState<string>("--");

  const [unlockAutorized, setUnlockAutorized] = useState<boolean>(false);

  console.log("unlockAutorized", unlockAutorized);

  const contract = useContract({
    address: caXEole,
    abi: xEoleAbi,
    signerOrProvider: signer,
  });

  const eoleToken = useBalance({
    address: address,
    token: caEole,
  });

  const xEoleToken = useBalance({
    address: address,
    token: caXEole,
  });

  useContractEvent({
    address: caXEole,
    abi: xEoleAbi,
    eventName: "CompoundingReward",
    listener() {
      xEoleToken.refetch();
    },
  });

  useEffect(() => {
    if (!contract) return;

    const waitFunction = async () => {
      await getEoleDeposit();
      await getXEoleStaked();
      await getRewardEarned();
      await getUnlockEoleAutorize();
    };

    waitFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    if (!contract || !unlockAutorized) return;
    const waitFunction = async () => {
      await getUnlockedTokenPerSec();
    };

    waitFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, unlockAutorized]);

  const getEoleDeposit = async () => {
    try {
      if (!contract) return;
      const eDeposit = await contract.getEoleDeposit();
      setEDeposit(BNToEtherString(eDeposit));
    } catch (error) {
      console.log("getEoleDeposit error", error);
    }
  };

  const getXEoleStaked = async () => {
    try {
      if (!contract) return;
      const xeDeposit = await contract.getXEoleStaked();
      setXEoleStaked(BNToEtherString(xeDeposit));
    } catch (error) {
      console.log("getXEoleStaked error", error);
    }
  };

  const getRewardEarned = async () => {
    if (!contract) return;
    try {
      const rewardEarned = await contract.getRewardEarned();
      setXEEarned(BNToEtherString(rewardEarned));
    } catch (error) {
      console.log("getXEoleStaked error", error);
    }
  };

  const getUnlockedTokenPerSec = async () => {
    if (!contract || !unlockAutorized) return;
    try {
      const unclockToken = await contract.getUnlockedTokenPerSec();
      setUnlockedTokenEarned(BNToEtherString(unclockToken));
    } catch (error) {
      console.log("getXEoleStaked error", error);
    }
  };

  console.log("unlockedTokenEarned", unlockedTokenEarned);

  const getUnlockEoleAutorize = async () => {
    try {
      if (!contract) return;
      const unlockAutorized = await contract.getUnlockEoleAutorize();
      setUnlockAutorized(unlockAutorized);
    } catch (error) {
      console.log("getUnlockEoleAutorize error", error);
    }
  };

  const compoundXEole = async () => {
    if (!contract) return;
    try {
      const tx = await contract.compound();
      await tx.wait();
      successToast(toast, "Compounding done");
    } catch (error) {
      console.log("getXEoleStaked error", error);
      errorToast(toast, "Error with compounding");
    }
  };

  const claimEole = async () => {
    if (!contract || !unlockAutorized) return;
    try {
      const tx = await contract.claim();
      await tx.wait();
      successToast(toast, "claim done");
    } catch (error) {
      console.log("claim error", error);
      errorToast(toast, "Error with claim");
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
        Dashboard
      </Text>
      <Box borderRadius="md" border="1px" borderColor="gray.500" p="24px">
        <TableContainer>
          <Table variant="simple">
            <TableCaption></TableCaption>
            <Thead>
              <Tr>
                <Th>Token</Th>
                <Th>Deposit/Stake</Th>
                <Th>Available</Th>
                <Th isNumeric>Earned</Th>
                <Th isNumeric>Claim</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <Image
                    style={{ width: 32, height: 32 }}
                    src={EoleTokenImage}
                    alt="eole-token"
                  />
                </Td>
                <Td>
                  <Text as="kbd">{numberFixed(eDeposit, 5)}</Text>
                </Td>
                <Td>
                  <Text as="kbd">
                    {numberFixed(eoleToken.data?.formatted, 5)}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text as="kbd">{numberFixed(unlockedTokenEarned, 5)}</Text>
                </Td>
                <Td isNumeric>
                  {" "}
                  <Button
                    isDisabled={!unlockAutorized}
                    onClick={claimEole}
                    colorScheme="blue"
                    h="1.75rem"
                    size="sm"
                  >
                    claim
                  </Button>
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Image
                    style={{ width: 32, height: 32 }}
                    src={XEoleTokenImage}
                    alt="xEole-token"
                  />
                </Td>
                <Td>
                  <Text as="kbd">{numberFixed(xEoleStaked, 5)}</Text>
                </Td>
                <Td>
                  <Text as="kbd">
                    {numberFixed(xEoleToken.data?.formatted, 5)}
                  </Text>
                </Td>
                <Td isNumeric>
                  <Text as="kbd">{numberFixed(xEEarned, 5)}</Text>
                </Td>
                <Td isNumeric>
                  {" "}
                  <Button
                    isDisabled={Number(xEoleStaked) <= 0}
                    onClick={compoundXEole}
                    colorScheme="blue"
                    h="1.75rem"
                    size="sm"
                  >
                    compound
                  </Button>
                </Td>
              </Tr>
              <ThCommingSonTd tokenIcon={EUsdcImage} />
              <ThCommingSonTd tokenIcon={EVlpImage} />
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Layout>
  );
};

const ThCommingSonTd: FC<{ tokenIcon: any }> = ({ tokenIcon }) => {
  return (
    <Tr>
      <Td>
        <Image style={{ width: 32, height: 32 }} src={tokenIcon} alt="token" />
      </Td>
      <CommingSonTd />
      <CommingSonTd />
      <CommingSonTd isNumeric />
      <CommingSonTd isNumeric />
    </Tr>
  );
};

const CommingSonTd: FC<{ isNumeric?: boolean }> = ({ isNumeric }) => {
  return (
    <Td isNumeric={isNumeric}>
      <Text opacity={0.4} as="kbd">
        coming soon
      </Text>
    </Td>
  );
};

export default Dashboard;
