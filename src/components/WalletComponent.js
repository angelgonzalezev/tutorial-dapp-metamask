import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import detectEthereumProvider from "@metamask/detect-provider";
import { useEffect, useState } from "react";
import { convertEth2Wei, formatBalance, formatChainAsNum } from "../utils/utils";

const WalletComponent = () => {
  const [hasProvider, setHasProvivider] = useState(false);
  const [wallet, setWallet] = useState();
  const [balance, setBalance] = useState();
  const [chainId, setChainId] = useState();
  const [transaction, setTransaction] = useState();
  const [txHash, setTxHash] = useState();
  const [message, setMessage] = useState();
  const [signature, setSignature] = useState();

  const msgParams = JSON.stringify({
    domain: {
      chainId,
      name: "Ether Mail",
      verifyingContract: wallet,
      version: "1",
    },
    message: {
      contents: message,
      name: "Tutorial dApp Metamask",
      wallet,
      message,
    },
    primaryType: "MyType",
    types: {
      MyType: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
        { name: "message", type: "string" },
      ],
    },
  });

  useEffect(() => {
    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true });
      const _chainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      setChainId(formatChainAsNum(_chainId));
      setHasProvivider(Boolean(provider));
    };
    getProvider();
  }, []);

  const handleConnect = () => {
    window.ethereum
      .request({
        method: "eth_requestAccounts",
      })
      .then((accounts) => onAccountChanged(accounts[0]))
      .catch((e) => console.log(e));
  };

  const onAccountChanged = (address) => {
    setWallet(address);
    getBalance(address);
  };

  const getBalance = async (address) => {
    const _balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    setBalance(formatBalance(_balance));
  };

  const handleReloadWindow = () => {
    window.location.reload();
  };

  window.ethereum.on("accountsChanged", (accounts) => onAccountChanged(accounts[0]));
  window.ethereum.on("chainChanged", handleReloadWindow);

  const handleSendTransaction = () => {
    window.ethereum
      .request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet,
            to: transaction.wallet,
            value: convertEth2Wei(transaction.value),
          },
        ],
      })
      .then((res) => setTxHash(res))
      .catch((e) => console.log(e));
  };

  const onWalletChange = (e) => {
    const param = e.target.name;
    const value = e.target.value;
    setTransaction({ ...transaction, [param]: value });
  };

  const onMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
  };

  const handleSign = () => {
    window.ethereum
      .request({
        method: "eth_signTypedData_v4",
        params: [wallet, msgParams],
      })
      .then((_signature) => setSignature(_signature))
      .catch((e) => console.log(e));
  };

  return (
    <Box w={"100%"} h={"100%"} p={8}>
      <Flex alignItems={"center"} justifyContent={"space-between"} w={"100%"}>
        <Text fontSize={"3xl"}>Tutorial dApp Metamask</Text>
        {hasProvider ? (
          <Button onClick={handleConnect} isDisabled={wallet ?? false}>
            Connect Wallet
          </Button>
        ) : (
          <Text color={"red"}>There is no provider installed</Text>
        )}
      </Flex>
      <Flex direction={"column"} gap={4}>
        {wallet && <Text>Wallet: {wallet}</Text>}
        {wallet && chainId && <Text>Chain Id: {chainId}</Text>}
        {balance && <Text>Balance: {balance}</Text>}
      </Flex>
      {wallet && (
        <Flex direction={"column"} mt={4} gap={4}>
          <Text fontSize={"2xl"}>Send Transaction</Text>
          <Input placeholder="Wallet direction" onChange={onWalletChange} name="wallet" />
          <Input placeholder="Amount" onChange={onWalletChange} name="value" />
          <Button onClick={handleSendTransaction}>Send Transaction</Button>
          {txHash && <Text>Tx Hash: {txHash}</Text>}
        </Flex>
      )}
      {wallet && (
        <Flex direction={"column"} mt={4} gap={4}>
          <Text fontSize={"2xl"}>Sign Message</Text>
          <Input placeholder="Message" onChange={onMessageChange} />
          <Button onClick={handleSign}>Send Transaction</Button>
          {signature && <Text>Signature: {signature}</Text>}
        </Flex>
      )}
    </Box>
  );
};
export default WalletComponent;
