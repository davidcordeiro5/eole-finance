import { ethers } from "ethers";

const bigNumberFormatUnits = (bigNumber: ethers.BigNumber) => {
  const value = ethers.utils.formatUnits(bigNumber, 18);

  return Number(parseFloat(value).toFixed(4));
};

export default bigNumberFormatUnits;
