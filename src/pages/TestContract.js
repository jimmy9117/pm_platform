import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const TestContract = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [value, setValue] = useState(0);
  const [newValue, setNewValue] = useState(0);
  const [transactionHash, setTransactionHash] = useState("");

  const contractAddress = '0xf0c94ce5Ab427A828dD00f60af845556DE77356A';
  const abi = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newValue",
          "type": "uint256"
        }
      ],
      "name": "ValueSet",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "getValue",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newValue",
          "type": "uint256"
        }
      ],
      "name": "setValue",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

    // 初始化 Web3
    useEffect(() => {
      const initWeb3 = async () => {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            setWeb3(web3Instance);
          } catch (error) {
            console.error('User denied account access');
          }
        } else if (window.web3) {
          const web3Instance = new Web3(window.web3.currentProvider);
          setWeb3(web3Instance);
        } else {
          console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
      };
      initWeb3();
    }, []);
  
    // 獲取帳戶
    useEffect(() => {
      const getAccounts = async () => {
        if (web3) {
          const accounts = await web3.eth.getAccounts();
          console.log(accounts);
          setAccounts(accounts);
        }
      };
      getAccounts();
    }, [web3]);
  
    // 初始化智能合約
    useEffect(() => {
      const initContract = async () => {
        if (web3) {
          try {
            // 檢查智能合約 ABI 是否存在
            if (!abi) {
              console.error('Smart contract ABI not found.');
              return;
            }
            // 建立合約實例
            const contractInstance = new web3.eth.Contract(abi, contractAddress);
            //console.log("輸出合約的值:",contractInstance);
            setContract(contractInstance);
          } catch (error) {
            console.error('Error initializing contract:', error);
          }
        }
      };
      initContract();
    }, [web3]);
  
  // 設置智能合約的值並獲取最新值
  const handleSetValueAndRefresh = async () => {
    if (contract) {
      try {
        setValue(0);
        const newValueUint = newValue; 
        const transactionReceipt = await contract.methods.setValue(newValueUint).send({ from: accounts[0] });

        // 监听交易回执，确保交易被确认后再获取最新值
        const transactionHash = transactionReceipt.transactionHash;
        console.log("hash值:",transactionHash);
        await transactionConfirmation(transactionHash);
      } catch (error) {
        console.log("交易失敗!");
        console.error('Error while setting value:', error);
      }
    }
  };

  // 監聽交易事件並等待交易確認
  const transactionConfirmation = async (transactionHash) => {
    if (web3) {
      console.log("以獲取到transactionConfirmation值");
      try {
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);
        console.log("智能合約收據:",receipt);
        if (receipt && receipt.status) {
          // 解析回傳值
          if (receipt.logs && receipt.logs.length > 0) {
            const returnValue = web3.eth.abi.decodeParameters(['uint256'], receipt.logs[0].data);
            console.log("回傳值:", returnValue[0]);
            const convertedValue1 = parseInt(returnValue[0], 10); // 使用 parseInt() 轉換成js數值
            console.log("轉成js數字:", convertedValue1);
            setValue(convertedValue1);
          }
        } else {
          console.error('Transaction failed:', receipt);
        }
      } catch (error) {
        console.error('Error while getting transaction receipt:', error);
      }
    }
  };
  
  return (
    <div>
      <h1>Simple Storage Smart Contract</h1>
      <p>Current Value: {value}</p>
      <input
        type="number"
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
      />
      <button onClick={handleSetValueAndRefresh}>Set Value and Refresh</button>
    </div>
  );
};
  
  export default TestContract;