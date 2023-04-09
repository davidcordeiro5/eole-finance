import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import React, { FC } from "react";

type InfoBoxProps = {
  title?: string;
  description?: string;
};

export const InfoBoxError: FC<InfoBoxProps> = ({ description, title }) => {
  return (
    <Alert status="error" borderRadius="md" p="8px 16px">
      <AlertIcon />
      {title && (
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {title}
        </AlertTitle>
      )}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export const WarningBox: FC<InfoBoxProps> = ({ description, title }) => {
  return (
    <Alert
      status="warning"
      flexDirection="column"
      alignItems="start"
      variant="left-accent"
      borderRadius="md"
      p="8px 16px"
    >
      <AlertIcon boxSize="24px" />
      {title && (
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {title}
        </AlertTitle>
      )}
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
};
