import { useAccount, useProvider, useSigner } from "wagmi";
import { Text, VStack, useToast } from "@chakra-ui/react";

import TokenBalance from "../../TokenBalance";
import CardContainer from "../CardContainer";
import { ChangeEvent, useEffect, useState } from "react";
import { ethers } from "ethers";
import { caEole, eoleAbi } from "../../../constants";
import SubmitButton from "../../SubmitButton";
import { caXEole } from "../../../constants/contractAddress";
import { xEoleAbi } from "../../../constants/abi";
import bigNumberFormatUnits from "../../../utils/bigNumberFormatUnits";
import { errorToast, successToast } from "../../../utils/toasts";
import InputNumber from "../../InputNumber";
import { InfoBoxError } from "../../InfoBoxs";

const EoleDepositAndxEoleMint = () => {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();

  const toast = useToast();

  const [eoleBalance, setEoleBalance] = useState<number>();
  const [allowance, setAllowance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<number>();
  const [needApproval, setNeedApproval] = useState<boolean>(true);

  const [isInvalidInputValue, setIsInvalidInputValue] =
    useState<boolean>(false);

  const [eloeContractProvided, setEloeContractProvided] =
    useState<ethers.Contract>();

  useEffect(() => {
    const getContract = async () => {
      try {
        const contract = new ethers.Contract(caEole, eoleAbi, provider);
        setEloeContractProvided(contract);
        const balanceOf = await contract.balanceOf(address);
        setEoleBalance(bigNumberFormatUnits(balanceOf));

        await getAllowance();
        if (allowance > 0) {
          setNeedApproval(false);
        }
      } catch (error) {
        console.log("getContract", error);
      }
    };

    getContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allowance > 0) {
      setNeedApproval(false);
    }
  }, [allowance]);

  const getEoleBalance = async () => {
    if (!eloeContractProvided) return;
    try {
      const balanceOf = await eloeContractProvided.balanceOf(address);

      setEoleBalance(bigNumberFormatUnits(balanceOf));
      setInputValue(bigNumberFormatUnits(balanceOf));
    } catch (error) {
      console.log("getEoleBalance", error);
    }
  };

  const getAllowance = async () => {
    if (!eloeContractProvided) return;
    try {
      const value = await eloeContractProvided.allowance(address, caXEole);
      setAllowance(bigNumberFormatUnits(value));
    } catch (error) {
      console.log("getAllowance error", error);
    }
  };

  const setApproval = async (amount: ethers.BigNumber) => {
    if (!signer) return;
    try {
      setIsLoading(true);
      const contract = new ethers.Contract(caEole, eoleAbi, signer);
      const tx = await contract.approve(caXEole, amount);
      getAllowance();
      await tx.wait(1);
      successToast(toast, "Approval done");
      setIsLoading(false);
    } catch (error) {
      console.log("getAllowance error", error);
      errorToast(toast, "Approval fail");
      setIsLoading(false);
    }
  };

  const depositEole = async () => {
    if (!signer || inputValue === undefined) return;
    try {
      setIsLoading(true);
      const contract = new ethers.Contract(caXEole, xEoleAbi, signer);
      const newValue = ethers.utils.parseUnits(inputValue.toString(), "ether");
      const tx = await contract.depositEole(newValue);
      await tx.wait();
      successToast(toast, "Eole depisit success", `EOLE amount: ${inputValue}`);
      setInputValue(undefined);
      setNeedApproval(true);
      setIsLoading(false);
    } catch (error) {
      console.log("DepositEole: error", error);
      errorToast(toast, "DepositEole error:", `${error}`);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const isValidInput = (value: any) => {
      return /^\d+$|^$/.test(value);
    };

    setIsInvalidInputValue(isValidInput);
    if (isValidInput(e.target.value)) {
      if (eoleBalance !== undefined && Number(e.target.value) > eoleBalance) {
        setIsInvalidInputValue(true);
      } else {
        setIsInvalidInputValue(false);
      }
      setInputValue(Number(e.target.value));
    }
  };

  const onSubmitApproval = async () => {
    if (!inputValue) return;
    const newValue = ethers.utils.parseUnits(inputValue.toString(), "ether");
    await setApproval(newValue);
  };

  return (
    <CardContainer title="Deposit EOLE to mint xEOLE">
      <Text alignSelf="end" fontSize="lg" as="kbd">
        APR -- %
      </Text>
      <VStack width="100%" spacing="12px" alignItems="stretch">
        <Text fontSize="lg" as="kbd" style={{ fontWeight: "bold" }}>
          Your balances
        </Text>
        <TokenBalance userAddres={address} symbol="EOLE" />
        <TokenBalance userAddres={address} symbol="xEOLE" />
      </VStack>
      <VStack width="100%" mt="auto" spacing="12px" alignItems="stretch">
        <InputNumber
          onChange={handleChange}
          placeholder="Enter EOLE to dispose"
          isInvalid={isInvalidInputValue}
          isLoading={isLoading}
          onMaxClick={getEoleBalance}
          value={inputValue || ""}
        />
        {isInvalidInputValue && (
          <InfoBoxError description="Your EOLE balance is insufficient" />
        )}
        {needApproval ? (
          <SubmitButton
            isDisabled={!inputValue || isInvalidInputValue || isLoading}
            label="Approve Eole"
            onClick={onSubmitApproval}
          />
        ) : (
          <SubmitButton
            isDisabled={!inputValue || isInvalidInputValue || isLoading}
            label="Deposit Eole"
            onClick={depositEole}
          />
        )}
      </VStack>
    </CardContainer>
  );
};

export default EoleDepositAndxEoleMint;
