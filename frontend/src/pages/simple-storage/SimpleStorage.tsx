import { Alert, AlertIcon } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { Text } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Flex } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAccount, useProvider, useSigner } from "wagmi";
import Layout from "../../components/Layout";

import {
  caArbitrumSimpleStorage,
  abiArbitrumSimpleStorage,
} from "../../constants";

const SimpleStorage = () => {
  const { address, isConnected } = useAccount();
  const { data: signer } = useSigner();
  const toast = useToast();
  const router = useRouter();

  const [number, setNumber] = useState<string>();

  const provider = useProvider();

  const [numberFromBC, setNumberFromBC] = useState();

  const getTheNumber = async () => {
    try {
      const contract = new ethers.Contract(
        caArbitrumSimpleStorage,
        abiArbitrumSimpleStorage,
        provider
      );
      let smartContractValue = await contract.getValue();
      setNumberFromBC(smartContractValue.toString());
    } catch (e) {
      toast({
        title: "Error",
        description: "An error occured.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(e);
    }
  };

  const setTheNumber = async () => {
    if (!signer) return;
    try {
      const contract = new ethers.Contract(
        caArbitrumSimpleStorage,
        abiArbitrumSimpleStorage,
        signer
      );
      let transaction = await contract.setValue(parseInt(number || ""));
      await transaction.wait();
      // router.push("/getNumber");
      toast({
        title: "Congratulations",
        description: "the number has been changed!",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "An error occured.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      console.log(e);
    }
  };

  return (
    <Layout>
      <Text>{`Yes it's uggly but not end`}</Text>
      {isConnected ? (
        <>
          <Flex alignItems="center">
            <Input
              placeholder="Your number..."
              onChange={(e) => setNumber(e.target.value)}
            />
            <Button colorScheme="blue" onClick={() => setTheNumber()}>
              Set
            </Button>
          </Flex>
          <Flex alignItems="center">
            <Button colorScheme="blue" onClick={() => getTheNumber()}>
              Get the number
            </Button>
            {numberFromBC ? (
              <Text ml="1rem">{numberFromBC}</Text>
            ) : (
              <Text ml="1rem">
                Please, click on this button to get the number.
              </Text>
            )}
          </Flex>
        </>
      ) : (
        <Alert status="warning" width="50%">
          <AlertIcon />
          Please, connect your Wallet.
        </Alert>
      )}
    </Layout>
  );
};

export default SimpleStorage;
