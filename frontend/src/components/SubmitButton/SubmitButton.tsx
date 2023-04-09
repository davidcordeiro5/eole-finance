import { Button } from "@chakra-ui/react";
import React, { FC } from "react";

type ButtonProps = {
  onClick?: any;
  label: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  style?: React.CSSProperties;
};

const SubmitButton: FC<ButtonProps> = ({
  onClick,
  label,
  isDisabled,
  isLoading,
  style,
}) => {
  return (
    <Button
      style={style}
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={onClick}
      p={4}
      color="#1a202c"
      fontWeight="bold"
      fontSize="18px"
      borderRadius="md"
      bgGradient="linear(to-l, #b8dcff, #447e99)"
      _hover={{
        bgGradient: "linear(to-l, #b8dcff, #447e99)",
      }}
      _active={{
        transform: "scale(0.98)",
      }}
    >
      {label}
    </Button>
  );
};

export default SubmitButton;
