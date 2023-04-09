import { ethers } from "ethers";

export const BNToEtherString = (wei: ethers.BigNumberish) => {
  return ethers.utils.formatEther(wei);
};
