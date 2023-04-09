import { Card, CardHeader, Divider, Heading } from "@chakra-ui/react";
import { FC, ReactNode } from "react";

type CardContainerProps = {
  title: string;
  children?: ReactNode;
  width?: string;
};

const CardContainer: FC<CardContainerProps> = ({ title, children, width }) => {
  return (
    <Card
      width={width ? width : "400px"}
      border="1px"
      borderColor="gray.500"
      p="24px"
      align="center"
    >
      <CardHeader alignSelf="center" p="0" mb="16px">
        <Heading as="h2" size="md">
          {title}
        </Heading>
      </CardHeader>
      <Divider mb="16px" />
      {children}
    </Card>
  );
};

export default CardContainer;
