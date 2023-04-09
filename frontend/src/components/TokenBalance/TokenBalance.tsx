import Image from "next/image";
import { FC, useState, useEffect } from "react";
import { useBalance, useContractEvent } from "wagmi";
import { caEole, eoleAbi } from "../../constants";
import { EoleTokenImage, XEoleTokenImage } from "../../assets/images";
import { caXEole } from "../../constants/contractAddress";
import { Flex, Text } from "@chakra-ui/react";
import { StaticImageData } from "next/image";
import bigNumberFormatUnits from "../../utils/bigNumberFormatUnits";
import { xEoleAbi } from "../../constants/abi";

type EoleBalanceProps = {
  userAddres?: `0x${string}` | undefined;
  symbol: "EOLE" | "xEOLE";
  amount?: number;
  locked?: boolean;
  amountOnly?: boolean;
};

type TokenType = {
  EOLE: {
    address?: `0x${string}` | undefined;
    icon: StaticImageData;
  };
  xEOLE: {
    address?: `0x${string}` | undefined;
    icon: StaticImageData;
  };
};

const TokenBalance: FC<EoleBalanceProps> = ({
  userAddres,
  symbol,
  locked,
  amount,
  amountOnly,
}) => {
  const [newBalance, setNewBalance] = useState<number>(0);
  const token: TokenType = {
    EOLE: { address: caEole, icon: EoleTokenImage },
    xEOLE: { address: caXEole, icon: XEoleTokenImage },
  };

  const { data, isRefetching, refetch } = useBalance({
    address: userAddres,
    token: token[symbol].address,
  });

  useContractEvent({
    address: caEole,
    abi: eoleAbi,
    eventName: "Approval",
    listener() {
      refetch();
    },
  });

  useContractEvent({
    address: caXEole,
    abi: xEoleAbi,
    eventName: "XEoleMinted",
    listener() {
      refetch();
    },
  });

  useContractEvent({
    address: caXEole,
    abi: xEoleAbi,
    eventName: "StakedXEole",
    listener() {
      refetch();
    },
  });

  useEffect(() => {
    if (data) {
      setNewBalance(bigNumberFormatUnits(data.value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Flex alignItems="center" gap="8px" justifyContent="space-between">
      <Text as="kbd" fontSize="md">
        {amountOnly ? (
          <>{amount ? amount.toFixed(2) : "0.00"}</>
        ) : (
          <>{isRefetching ? "...." : newBalance.toFixed(2)}</>
        )}
      </Text>
      <Flex alignItems="center" gap="8px">
        <Text as="i" fontSize="md">
          {symbol}
        </Text>
        {locked ? (
          <Text style={{ lineHeight: "32px" }} fontSize="3xl">
            🔒
          </Text>
        ) : (
          <Image
            style={{ width: 32, height: 32 }}
            src={token[symbol].icon}
            alt={symbol}
          />
        )}
      </Flex>
    </Flex>
  );
};

export default TokenBalance;
