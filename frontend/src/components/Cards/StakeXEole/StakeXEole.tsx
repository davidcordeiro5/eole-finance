import { ChangeEvent, useEffect, useState } from "react";
import {
  useAccount,
  useBalance,
  useProvider,
  useSigner,
  useContract,
} from "wagmi";
import { VStack, Text, Divider, useToast, Link } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import { ethers } from "ethers";

import CardContainer from "../CardContainer";
import TokenBalance from "../../TokenBalance";
import InputNumber from "../../InputNumber";
import SubmitButton from "../../SubmitButton";
import { caEole, caXEole } from "../../../constants/contractAddress";
import bigNumberFormatUnits from "../../../utils/bigNumberFormatUnits";
import { InfoBoxError } from "../../InfoBoxs";
import { eoleAbi, xEoleAbi } from "../../../constants/abi";
import { errorToast, successToast } from "../../../utils/toasts";

const StakeXEole = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();

  const toast = useToast();

  const [xeoleBalance, setXEoleBalance] = useState<number>();
  const [xEoleStaked, setXEoleStaked] = useState<number>(0);

  const [xEoleApr, setXEoleApr] = useState<number>(0);
  const [inputValue, setInputValue] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInvalidInputValue, setIsInvalidInputValue] =
    useState<boolean>(false);

  const { data } = useBalance({
    address: address,
    token: caXEole,
  });

  useEffect(() => {
    const mount = async () => {
      if (!signer) return;
      try {
        const contract = new ethers.Contract(caXEole, xEoleAbi, signer);
        const xEoleStaked = await contract.getXEoleStaked();
        setXEoleStaked(bigNumberFormatUnits(xEoleStaked));
        await getxEoleApr();
      } catch (error) {
        console.log("mount error", error);
      }
    };

    mount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signer]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setXEoleBalance(bigNumberFormatUnits(data.value));
  }, [data]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isValidInput = (value: any) => {
      return /^\d+$|^$/.test(value);
    };

    setIsInvalidInputValue(isValidInput);
    if (isValidInput(e.target.value)) {
      if (xeoleBalance !== undefined && Number(e.target.value) > xeoleBalance) {
        setIsInvalidInputValue(true);
      } else {
        setIsInvalidInputValue(false);
      }
      setInputValue(Number(e.target.value));
    }
  };

  const stakeXEole = async () => {
    if (!signer || inputValue === undefined) return;
    try {
      setIsLoading(true);
      const contract = new ethers.Contract(caXEole, xEoleAbi, signer);
      const balanceOfPool = contract.balanceOf(caXEole);
      const bigVal = ethers.utils.parseUnits(inputValue.toString(), "ether");
      const tx = await contract.stakeXEole(bigVal);
      await tx.wait();
      setXEoleStaked((crr) => (crr += inputValue));
      successToast(toast, "xEole stake success", `xEole amount: ${inputValue}`);
      setInputValue(undefined);
      setIsLoading(false);
    } catch (error) {
      console.log("stake error", error);
      errorToast(toast, "Stake fail");
      setIsLoading(false);
    }
  };

  const getxEoleApr = async () => {
    if (!signer) return;

    try {
      const contract = new ethers.Contract(caXEole, xEoleAbi, signer);
      const eoleSC = new ethers.Contract(caEole, eoleAbi, signer);

      const ttStakedBN = await contract.getTotalXEoleStaked();
      const ttLockStake = bigNumberFormatUnits(ttStakedBN);
      console.log("ttLockStake", ttLockStake);

      const resBN = await eoleSC.getTotalRewardDistributed();
      const incentive = bigNumberFormatUnits(resBN);
      console.log("incentive", incentive);

      const userShareOfPoll = (1 / ttLockStake) * 100;

      const useIncentive = (incentive * userShareOfPoll) / 100;
      setXEoleApr(((useIncentive / 1) * 100) / 2);
    } catch (error) {
      console.log("getxEoleApr", error);
    }
  };

  return (
    <CardContainer title="Staking xEOLE">
      <Text alignSelf="end" fontSize="lg" as="kbd">
        APR ~{parseFloat(`${xEoleApr}`).toFixed(3)}%
      </Text>
      <VStack width="100%" spacing="12px" alignItems="stretch">
        <Text fontSize="lg" as="kbd" style={{ fontWeight: "bold" }}>
          Balance
        </Text>
        <TokenBalance userAddres={address} symbol="xEOLE" />
        <Divider w="200px" alignSelf="center" />
        <Text fontSize="lg" as="kbd" style={{ fontWeight: "bold" }}>
          Stake
        </Text>
        <TokenBalance
          userAddres={address}
          symbol="xEOLE"
          amount={!xEoleStaked ? 0 : xEoleStaked}
          amountOnly
          locked
        />
      </VStack>
      <VStack
        width="100%"
        mt="auto"
        spacing="12px"
        alignItems="stretch"
        style={{ marginTop: 64 }}
      >
        {xEoleStaked > 0 && (
          <Link alignSelf="end" href="/dashboard">
            See reward <ExternalLinkIcon mx="2px" />
          </Link>
        )}
        <InputNumber
          onChange={handleChange}
          placeholder="Amount xEOLE to stake"
          isInvalid={isInvalidInputValue}
          isLoading={isLoading}
          onMaxClick={() => setInputValue(xeoleBalance)}
          value={inputValue || ""}
        />
        {isInvalidInputValue && (
          <InfoBoxError description="Your xEOLE balance is insufficient" />
        )}
        <SubmitButton
          isDisabled={!inputValue || isInvalidInputValue || isLoading}
          label="Stake xEOLE"
          onClick={stakeXEole}
        />
      </VStack>
    </CardContainer>
  );
};

export default StakeXEole;
