import Layout from "../components/Layout";
import { Text } from "@chakra-ui/react";

function Page() {
  return (
    <Layout>
      <Text
        m="auto"
        alignSelf="center"
        bgGradient="linear(to-l, #447e99, #b8dcff)"
        bgClip="text"
        fontSize="6xl"
        fontWeight="extrabold"
      >
        Welcome to Eole Finance !
      </Text>
    </Layout>
  );
}

export default Page;
