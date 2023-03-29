import Image from "next/image";

import { Flex } from "@chakra-ui/layout";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { EoleImage } from "../../assets/images";

const Header = () => {
  return (
    <Flex w="100%" justifyContent="space-between" alignItems="center" p="8px 0">
      <Image src={EoleImage} alt="Eole logo" width={120} height={80} />
      <ConnectButton />
    </Flex>
  );
};

export default Header;
