import { Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { ChangeEvent, FC } from "react";

type InputNumberProps = {
  placeholder: string;
  isInvalid?: boolean;
  isLoading?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onMaxClick?: () => void;
  value?: string | number | readonly string[] | undefined;
};

const InputNumber: FC<InputNumberProps> = ({
  onChange,
  isLoading,
  placeholder,
  isInvalid,
  onMaxClick,
  value,
}) => {
  return (
    <InputGroup size="md">
      <Input
        isInvalid={isInvalid}
        errorBorderColor="red.400"
        focusBorderColor={isInvalid ? "red.400" : "blue.300"}
        pr="4.5rem"
        type="number"
        placeholder={placeholder}
        onChange={onChange}
        value={value}
      />
      <InputRightElement width="4.5rem">
        <Button
          onClick={onMaxClick}
          isLoading={isLoading}
          colorScheme="blue"
          h="1.75rem"
          size="sm"
        >
          Max
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};

export default InputNumber;
