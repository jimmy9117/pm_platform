import React, { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import { Grid, List,Divider,Button,Icon,Modal,Header, Form,Dropdown } from "semantic-ui-react";

import firebase from "../utils/firebase";
import "firebase/auth";
import Canbanpage from"./Canbanpage";
import { BsChevronDown } from 'react-icons/bs'; // 這裡引入了 BsChevronDown


//Ethers.js
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract ,ethers} from 'ethers';
import { Interface, Log } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";





function CardReviewArea(){
    const navigate = useNavigate();
    const [canbandata,setcanbandata] = useState([]);
    const [memberdata,setmemberdata] = useState([]);
    const user = firebase.auth().currentUser.uid;
    const location = useLocation();
    const workspaceId = location.state.data.workspaceId;
    const [carddata,setCarddata] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [selectedCardMember, setSelectedCardMember] = useState([]);
    const [openViewCard,setopenViewCard] = useState(false);
    const [openCardConfirmModal,setOpenCardConfirmModal] = useState(false);
    const [openCardReturnModal,setOpenCardReturnModal] = useState(false);
    const [openTransfermoney,setOpenTransfermoney] = useState(false);
    const [intputamount,setIntputamount] = useState("");
    
    // 初始化 ethers.js 和智能合约
  const contractAddress = '0x72D412898d2490f04f6F1F0c3BeF2e61455787e1';
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const cardStorageContract = new Contract(contractAddress, contractABI, signer);
  const contractInterface = new Interface(contractABI);
  const walletAddress = signer.getAddress();
  provider.send("eth_accounts", []).then(accounts => {
    // console.log(accounts);
  });
  
    const [employeeInfo, setEmployeeInfo] = useState([]);

  

    //點擊查看卡片
    const handleClickViewCard = (cardid,member) =>{
        console.log("點擊查看cardid:",cardid);
        console.log("點擊查看cardmember:",member);
        setopenViewCard(true);
        setSelectedCardId(cardid);
        setSelectedCardMember(member);
     
    };

    // 抓取所有卡片
    React.useEffect(() => {
        const workspacesQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban');
        const unsubscribeCanban = workspacesQuery.onSnapshot((workspaceSnapshot) => {
            const promises = workspaceSnapshot.docs.map((docSnapshot) => {
                const canbanid = docSnapshot.id;
                console.log("canbanid:", canbanid);

                const subcollectionQuery = firebase.firestore().collection("workspace").doc(workspaceId).collection("canban").doc(canbanid).collection("list");
                const unsubscribeList = subcollectionQuery.onSnapshot((listSnapshot) => {
                    listSnapshot.docs.forEach((listDoc) => {
                        const listId = listDoc.id;
                        console.log("listId:", listId);

                        const cardQuery = firebase.firestore().collection("workspace").doc(workspaceId).collection("canban").doc(canbanid).collection("list").doc(listId).collection("card");
                        const unsubscribeCard = cardQuery.where("state", "==", "待審核").onSnapshot((cardSnapshot) => {
                            const newCardData = cardSnapshot.docs.map((cardDoc) => ({
                                id: cardDoc.id,
                                ...cardDoc.data()
                            }));

                            // 使用 Set 來確保每個卡片 ID 是唯一的
                            setCarddata((prevCardData) => {
                                const uniqueCardData = new Set([...prevCardData, ...newCardData]);
                                return Array.from(uniqueCardData);
                            });
                        });

                        return () => unsubscribeCard();
                    });
                });

                return () => unsubscribeList();
            });
        });

        return () => unsubscribeCanban();
    }, [workspaceId]);


    //抓取卡片資料
    React.useEffect(() => {
        console.log("carddata 狀態變化:", carddata);
      }, [carddata]);

    const test =()=>{
        console.log("workspaceid:",workspaceId);
        // 將工作區ID轉換為 bytes32
     // 將工作區ID轉換為 bytes32
    const workspaceKey = ethers.solidityPackedKeccak256(['string'], [workspaceId]);
    console.log("未改變的數值:", workspaceId);
    console.log("工作區ID轉換為bytes32:", workspaceKey);
    setOpenTransfermoney(true);
    };
  
    // 將確認完成卡片上鏈和計算人員積分
    const handleCompleteCard = async () => {
        console.log("上鏈按鈕");
        console.log("SelectedCardMember:", selectedCardMember);
        console.log("workspaceid:",workspaceId);

       
        // 將卡片人員的地址陣列上鏈
        const data = cardStorageContract.interface.encodeFunctionData('completeCard', [selectedCardMember,workspaceId]);

        // 發送交易
        const tx = await signer.sendTransaction({
            to: contractAddress,
            data: data,
        });

        // 等待交易確認
        const receipt = await tx.wait();

        // 處理交易收據
        console.log("receipt回傳值:", receipt.confirmations);
        console.log("完整訊息", receipt);
        // console.log("Transaction hash:", receipt.transactionHash);
        // console.log("Block number:", receipt.blockNumber);
        // console.log("Gas used:", receipt.gasUsed.toString());
        // console.log("Complete card transaction confirmed.");
        setopenViewCard(false);
        setOpenCardReturnModal(false);
    };


   // 上鏈人員資料監聽事件
    const eventName = 'CardCompleted';
    const eventFilter = cardStorageContract.filters[eventName]();
    const eventListener = (employeeAddress, workspace, points, event) => {
        console.log(`錢包地址: ${employeeAddress}, 工作區ID: ${workspace}, 積分: ${points}`);
    };

    // 監聽事件
    cardStorageContract.on(eventName, eventListener);

   // 等待 5 秒鐘再取消註冊事件
    setTimeout(() => {
        cardStorageContract.off(eventName, eventListener);
    }, 7000);

   // 人員積分資料監聽事件
   const eventNameB = 'PercentageUpdated';
   const eventFilterB = cardStorageContract.filters[eventNameB](); // 注意此處修正
   const eventListenerB = (employeeAddress, workspace, points, percentage, test, event) => {
       console.log(`錢包地址: ${employeeAddress}, 工作區ID: ${workspace}, 積分: ${points} 百分比: ${percentage}`);
   };
   
   // 監聽事件
   cardStorageContract.on(eventNameB, eventListenerB); // 注意此處修正
   
   // 等待 5 秒鐘再取消註冊事件
   setTimeout(() => {
       cardStorageContract.off(eventNameB, eventListenerB); // 注意此處修正
   }, 7000);
   

  // 確認轉帳
const handletransferfunction = () => {
    console.log("轉帳金額:", intputamount);
    console.log("employeeInfo:",employeeInfo);
    // const aumonta = BigNumber.parse(intputamount, 18); // 转换为 wei，并确保小数点后至少有18位

    // console.log("aumonta", aumonta);
  
    // // 轉帳
    // const tx = cardStorageContract.transferFunds(workspaceId, aumonta);
  
    // // 等待交易被確認
    // tx.then(receipt => {
    //   console.log("交易成功");
    // });
  
    setIntputamount("");
    setOpenTransfermoney(false);
  };
  
    //處理退出轉帳
    const handleuittransferfunction =()=>{
        setIntputamount("");
        setOpenTransfermoney(false);
    }

    const getAllEmployeeInfo = async () => {
        try {
          const result = await cardStorageContract.getEmployeeInfoInWorkspace(workspaceId);
          const [employeeAddresses, points, percentages] = result;
    
          const newEmployeeInfo = employeeAddresses.map((address, index) => ({
            address,
            points: Number(points[index]), // 轉換為 Number
            percentage: Number(percentages[index]), // 轉換為 Number
          }));
    
          setEmployeeInfo(newEmployeeInfo);
        } catch (error) {
          console.error("Error fetching employee info:", error);
        }
      };
    // 設定定期獲取的時間間隔（毫秒為單位，這裡設定為一小時）
    const intervalTime = 5000;

   // 設定定期獲取的定時器
    const intervalId = setInterval(() => {
        getAllEmployeeInfo();
    }, intervalTime);
      // 等待 5 秒鐘再取消註冊事件

//    setTimeout(() => {
//        cardStorageContract.off(eventNameB, eventListenerB); // 注意此處修正
//    }, 7000);

  // 總積分調用
async function callContract() {
    try {
      const result = await cardStorageContract.testGetEmployeePercentages(workspaceId);
      console.log("Result:", result);
      // 处理返回的结果
      const workspaceKey = result[0];
      const totalPoints = result[1];
  
      console.log('Workspace Key:', workspaceKey);
      console.log('Total Points:', totalPoints);
    } catch (error) {
      console.error('Error calling contract function:', error);
    }
  }
   //callContract();

  // 測試單獨一個人資料
// async function fetchTestPercentage() {
//     try {
//         // 獲取所有已連接的錢包地址
//         const accounts = await provider.send("eth_accounts", []);

//         const testAddress = accounts[0];
//         console.log("testAddress123", testAddress);
        
//         // 調用 testCalculatePoints 函式，並等待 Promise 完成
//         const result = await cardStorageContract.testCalculatePoints(workspaceId, testAddress);

//         // 解構返回的結果
//         const [workspaceKey, totalPoints, testPoints,testPercentages] = result;

//         // 在控制台上輸出結果
//         console.log("Workspace Key:", workspaceKey);
//         console.log("Total Points:", totalPoints);
//         console.log("points:", testPoints);
//         console.log("Percentages:", testPercentages);
        
//     } catch (error) {
//         // 處理錯誤
//         console.error("Error fetching test percentage:", error);
//     }
// }

// // 調用測試函式
// fetchTestPercentage();


     
    return <Grid style={{  }}>
        {/* 預設切成16等份 */}
        <Grid.Row>
        <Grid.Column width={3}>左空白</Grid.Column>
            <Grid.Column width={2}>
                <List animated selection>
                    <List.Item >
                        看板
                    </List.Item>
                    <List.Item>
                        成員
                      
                    </List.Item>
                    <List.Item>
                        首頁
                    </List.Item>
                    <Divider/>
                </List>
                <List >
                    <List.Item>
                      工作區 
                    
                    </List.Item>
                </List>

            </Grid.Column>

            <Grid.Column width={8}>
            <Header>待審核區</Header>
                {carddata.map((card) => (
                <div key={card.id}>
                    <p>卡片名稱：{card.Cardname} 
                        {/* 截止時間:{card.deadline} */}
                        <Button onClick={() =>handleClickViewCard(card.id,card.member)}>查看</Button>
                    </p>
                    
                </div>
                
                ))}
                 <div>
                {/* 在這裡使用 employeeInfo 狀態渲染前端畫面 */}
                {employeeInfo.map((employee, index) => (
                    <div key={index}>
                    <p>Address: {employee.address}</p>
                    <p>Points: {employee.points}</p>
                    <p>Percentage: {employee.percentage/10}%</p>
                    <hr />
                    </div>
                ))}
                </div>
                 {/* 審核卡片畫面 */}
                <Modal  onClose={()=>setopenViewCard(false)} open={openViewCard}>
                    {carddata.map((card)=>(
                        card.id === selectedCardId && (
                            <React.Fragment key={card.id}>
                                <Modal.Header>
                                    審查卡片:{card.Cardname}
                                    <Button icon="close" onClick={() => setopenViewCard(false)}></Button>
                                </Modal.Header>
                                <Modal.Description>
                                    <Header>描述</Header>
                                </Modal.Description>
                                <Modal.Description>
                                <Button onClick={()=>setOpenCardConfirmModal(true)}>通過</Button>
                                <Button onClick={()=>setOpenCardReturnModal(true)}>退回</Button>
                                </Modal.Description>
                            </React.Fragment>
                        )
                    ))}
                </Modal> 
                  {/* 送出確認卡片 */}
                  <Modal size="mini" onClose={()=>setOpenCardConfirmModal(false)} open={openCardConfirmModal}>
                    <Modal.Header>確認卡片通過嗎</Modal.Header>
                    <Modal.Description>
                    <Button onClick={()=>handleCompleteCard()}>確認</Button>
                    <Button onClick={()=>setOpenCardConfirmModal(false)}>再想想</Button>
                    </Modal.Description>
                </Modal>
                {/* 退回卡片畫面 */}
                <Modal size="mini" onClose={()=>setOpenCardReturnModal(false)} open={openCardReturnModal}>
                    <Modal.Header>確認卡片退回嗎</Modal.Header>
                    <Modal.Description>
                    <Button >確認</Button>
                    <Button onClick={()=>setOpenCardReturnModal(false)}>再想想</Button>
                    </Modal.Description>
                </Modal>
            </Grid.Column>
            <Grid.Column width={3}>
            <Button onClick={test}>更新</Button>
            {/* <Modal size="mini" onClose={()=>setOpenTransfermoney(false)} open={openTransfermoney}>
                    <Modal.Header>轉帳金額</Modal.Header>
                    <Form.Input 
                    label ="金額"
                    placeholder="輸入金額" 
                    value = {intputamount}
                    onChange={(e) => setIntputamount(e.target.value)}
                    /> 
                    <Modal.Description>
                    <Button onClick={handletransferfunction}>確認</Button>
                    <Button onClick={handleuittransferfunction}>再想想</Button>
                    </Modal.Description>
                </Modal> */}
            </Grid.Column>
        </Grid.Row>
        
    </Grid>
     {/* 完成 Modal */}
   
    
}

export default CardReviewArea;