import { BigNumber, FixedNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";

export const fixedNumberBNFormated = (stringBNFormated: string) => {
  return FixedNumber.fromValue(
    BigNumber.from(parseUnits(stringBNFormated, 18)),
    18
  );
};
