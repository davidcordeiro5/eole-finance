import { Flex } from "@chakra-ui/layout";
import { FC, ReactNode } from "react";
import NextHead from "next/head";
import Header from "../Header";

type LayoutProps = {
  children?: ReactNode;
  headTitle?: string;
};
const Layout: FC<LayoutProps> = ({ children, headTitle }) => {
  return (
    <>
      <NextHead>
        <title>{headTitle ? headTitle : "Eole finance"}</title>
      </NextHead>
      <Flex
        direction="column"
        maxW="1100px"
        minH="100vh"
        w="100%"
        m="auto"
        p="0 16px"
      >
        <Header />
        {children}
      </Flex>
    </>
  );
};

export default Layout;
