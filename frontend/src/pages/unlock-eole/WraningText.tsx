import { Heading, Text } from "@chakra-ui/react";

const WraningText = () => {
  return (
    <>
      <Heading>🖐️</Heading>
      <Text as="b" mb="12px">
        The length of time you choose to retrieve your EOLEs directly affects
        the amount you will receive after the unlock period.
      </Text>
      <Text as="u" mb="4px">
        - If you select 6 months, you will keep a conversion ratio of 1:1
      </Text>
      <Text as="i" pl="16px" mb="4px">
        Example: I deposit 180 xEOLE, I will receive 1 EOLE per day for 6
        months, that is 180 EOLE.
      </Text>
      <Text as="u" mb="4px">
        - If you select 30 days, then you will have 50% of your EOLE with a
        ratio of 1:0.5
      </Text>
      <Text as="i" pl="16px">
        Example: I deposit 180 xEOLE, I will receive 3 EOLE per day for 30
        months, that is 90 EOLEs.
      </Text>
    </>
  );
};

export default WraningText;
