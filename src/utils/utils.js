export const formatBalance = (rawBalance) => {
  return (parseInt(rawBalance) / 1000000000000000000).toString();
};

export const formatChainAsNum = (chainIdHex) => {
  return parseInt(chainIdHex);
};

export const convertEth2Wei = (value) => {
  return Number(value * 1000000000000000000).toString(16);
};
