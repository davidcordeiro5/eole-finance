import Image from "next/image";
import { useRouter } from "next/router";

import { Flex, HStack } from "@chakra-ui/layout";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { EoleImage } from "../../assets/images";

import NextLink from "next/link";
import { Button, Link } from "@chakra-ui/react";
import { FC } from "react";

type NavLinkProps = {
  pathname: string;
  pathnameRouter: string;
  label: string;
};

const NavLink: FC<NavLinkProps> = ({ pathname, pathnameRouter, label }) => {
  return (
    <Link
      style={{ textDecoration: "none" }}
      color={pathnameRouter === pathname ? "white" : "gray"}
      _hover={{
        color: "white",
      }}
      fontSize="md"
      fontWeight="bold"
      as={NextLink}
      href={pathname}
    >
      {label}
    </Link>
  );
};

const Header = () => {
  const router = useRouter();

  return (
    <Flex w="100%" justifyContent="space-between" alignItems="center" p="8px 0">
      <HStack spacing="24px">
        <Image
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
          src={EoleImage}
          alt="Eole logo"
          width={110}
          height={80}
        />
        {router.pathname !== "/" && (
          <>
            <NavLink
              pathname="/stake"
              pathnameRouter={router.pathname}
              label="Stake"
            />
            <NavLink
              pathname="/vaults"
              pathnameRouter={router.pathname}
              label="Vaults"
            />
            <NavLink
              pathname="/positions"
              pathnameRouter={router.pathname}
              label="Positions"
            />

            <NavLink
              pathname="/simple-storage"
              pathnameRouter={router.pathname}
              label="SimpleStorage (temp)"
            />
          </>
        )}
      </HStack>
      {router.pathname !== "/" ? (
        <ConnectButton
          showBalance={{
            smallScreen: true,
            largeScreen: false,
          }}
          chainStatus="none"
        />
      ) : (
        <Button
          borderRadius="12px"
          colorScheme="blue"
          onClick={() => window.open("/stake", "_blank", "noopener,noreferrer")}
        >
          Launch App
        </Button>
      )}
    </Flex>
  );
};

export default Header;
