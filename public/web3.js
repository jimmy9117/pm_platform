// 設定智能合約的位址和 ABI
var contractAddress = '0x6c043d4853246b0b0df76864235b41E183F4a352';
var abi = [
	{
		"constant": false,
		"inputs": [],
		"name": "checkGoalReached",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "fund",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "kill",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"name": "_duration",
				"type": "uint256"
			},
			{
				"name": "_goalAmount",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "deadline",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "ended",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "goalAmount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"name": "investors",
		"outputs": [
			{
				"name": "addr",
				"type": "address"
			},
			{
				"name": "amount",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "numInvestors",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "status",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalAmount",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]

// 連接到 Goerli 測試鏈
var provider = ethers.getDefaultProvider('goerli');

// 用合約位址和 ABI 初始化合約物件
var contract = new ethers.Contract(contractAddress, abi, provider);

function updateContractInfo() {
    window.ethereum.enable().then(function (accounts) {
        var provider = new ethers.providers.Web3Provider(window.ethereum);
        document.getElementById('contractAddress').textContent = contractAddress;
        
    });
}

function invest(amount) {
    // 確認 MetaMask 已經連接
    if (typeof window.ethereum !== 'undefined') {
        // 創建一個新的 ethers.providers.Web3Provider 來與 MetaMask 進行互動
        
    
        // 獲取當前使用者的帳戶地址
        provider.getSigner().getAddress().then(function (address) {
			try {
				await window.ethereum.request({ method: "eth_requestAccounts" });
        })\.catch(function (error) {
            // 無法獲取帳戶地址
            console.error('無法獲取帳戶地址：', error);
            document.getElementById('investmentStatus').textContent = '無法獲取帳戶地址';
        });
    } else {
        // MetaMask 未安裝或未連接
        console.error('MetaMask 未安裝或未連接');
        document.getElementById('investmentStatus').textContent = 'MetaMask 未安裝或未連接';
    }
}

updateContractInfo();