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


    // 初始化 ethers.js 和智能合约
  const contractAddress = '0x6A9a9A0f134A547F4BE52234dCB742C202f918c4';
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const cardStorageContract = new Contract(contractAddress, contractABI, signer);
  const contractInterface = new Interface(contractABI);

  //測試 
//   const data = '0x726ab0b200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000315e95ad7e4e97aaa1e2f089f50b42f6b4abeeb6';
//   const iface = new ethers.utils.Interface(contractABI);
//   const decodedData = iface.parseTransaction({ data });
//   // 顯示解碼結果
//   console.log("測試上鏈直:",decodedData);
    
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


   // 定義事件名稱和監聽器函式
    const eventName = 'CardCompleted';
    const eventFilter = cardStorageContract.filters[eventName]();

    // 建立事件監聽器的回調函式
    const eventListener = (employeeAddress, workspace, points, event) => {
        console.log(`錢包地址: ${employeeAddress}, 工作區ID: ${workspace}, 積分: ${points}`);
    };

    // 監聽事件
    cardStorageContract.on(eventName, eventListener);

   // 等待 5 秒鐘再取消註冊事件
    setTimeout(() => {
        cardStorageContract.off(eventName, eventListener);
    }, 4000);



// 定義一個非同步函式，它允許使用 await 運算式
async function fetchData() {
    try {
        // 調用 getEmployeePercentages 函式，並等待 Promise 完成
        const result = await cardStorageContract.getEmployeePercentages(workspaceId);

        // 解包 Proxy 對象中的陣列
        const totalPoints = result[0];
        const addresses = result[1].map(address => address.toString());
        const percentages = result[2].map(percent => percent.toNumber());

        // 在控制台上輸出結果
        console.log("Total Points:", totalPoints);
        console.log("Addresses:", addresses);
        console.log("Percentages:", percentages);
    } catch (error) {
        // 處理錯誤
        console.error("Error fetching data:", error);
    }
}

// 調用 fetchData 函式
fetchData();


// 調用 fetchData 函式
fetchData();


  

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
  // 调用函数
//   callContract();

// 測試單獨一個人資料
async function fetchTestPercentage() {
    try {
        // 指定一個已知的人員地址
        const testAddress ="0xdbE430Ab7b69E95948aF9a003341838FA937fcB4";

        // 調用 testCalculatePercentage 函式，並等待 Promise 完成
        const result = await cardStorageContract.testCalculatePercentage(workspaceId,testAddress);

        // 將 Proxy 對象轉換為陣列
        const workspaceKey = result[0];
        const totalPoints = result[1];
        const testPercentage = result[2];

        // 在控制台上輸出結果
        console.log("Workspace Key:", workspaceKey);
        console.log("Total Points:", totalPoints);
        console.log("Test Percentage:", testPercentage);
    } catch (error) {
        // 處理錯誤
        console.error("Error fetching test percentage:", error);
    }
}

// 調用 fetchTestPercentage 函式
//fetchTestPercentage();



     
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
            <Grid.Column width={3}>右空白
            <Button onClick={test}></Button>
            </Grid.Column>
        </Grid.Row>
        
    </Grid>
     {/* 完成 Modal */}
   
    
}

export default CardReviewArea;