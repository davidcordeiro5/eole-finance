import React, { FC } from "react";
import CardContainer from "../CardContainer";
import { VStack, Text, Flex, Highlight } from "@chakra-ui/react";
import SubmitButton from "../../SubmitButton";
import { WarningBox } from "../../InfoBoxs";

type Props = {
  title: string;
  buttonLabel: string;
  info: string;
  onSubmit: () => void;
  amountReceived?: number;
  slashed?: boolean;
};

const UnlockEoleCard: FC<Props> = ({
  amountReceived,
  title,
  buttonLabel,
  onSubmit,
  info,
  slashed,
}) => {
  return (
    <CardContainer title={title}>
      <VStack mt="16px" width="100%" h="100%" justifyContent="space-between">
        <WarningBox title={info} />

        <VStack style={{ marginTop: 32 }} width="100%">
          <Flex alignItems="start" width="100%">
            <Text>
              You will receive in a linear way token during
              <Highlight
                query={`${amountReceived}`}
                styles={{ color: "#FFF", py: "1", fontWeight: "bold" }}
              >
                {` ${amountReceived} `}
              </Highlight>
              {slashed ? "30" : "180"} days
            </Text>
          </Flex>
          <SubmitButton
            style={{ width: "100%" }}
            label={buttonLabel}
            onClick={onSubmit}
          />
        </VStack>
      </VStack>
    </CardContainer>
  );
};

export default UnlockEoleCard;
