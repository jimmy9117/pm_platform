import React, { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import { Grid, List,Divider,Button,Icon,Modal,Header, Form,Dropdown } from "semantic-ui-react";
import Workspace from "../components/Workspace";
import firebase from "../utils/firebase";
import "firebase/auth";
import Canbanpage from"./Canbanpage";
import { BsChevronDown } from 'react-icons/bs'; // 這裡引入了 BsChevronDown


//Ethers.js
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";

function CardReviewArea(){
    const navigate = useNavigate();
    const [canbandata,setcanbandata] = useState([]);
    const [memberdata,setmemberdata] = useState([]);
    const user = firebase.auth().currentUser.uid;
    const location = useLocation();
    const workspaceId = location.state.data.workspaceId;
    const [carddata,setCarddata] = useState([]);
    const [openViewCard,setopenViewCard] = useState(false);
    const [selectedCardId, setSelectedCardId] = useState("");
    const [openCardConfirmModal,setOpenCardConfirmModal] = useState(false);
    const [openCardReturnModal,setOpenCardReturnModal] = useState(false);

    //點擊查看卡片
    const handleClickViewCard = (cardid) =>{
        console.log("點擊查看:",cardid);
         setSelectedCardId(cardid)
        setopenViewCard(true);
    };
   // 抓取所有卡片
React.useEffect(() => {
    // 監聽所有工作區的更改
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
                    // 卡片資料
                    const cardQuery = firebase.firestore().collection("workspace").doc(workspaceId).collection("canban").doc(canbanid).collection("list").doc(listId).collection("card");
                 
                    const unsubscribeCard = cardQuery.where("state", "==", "待審核").onSnapshot((cardSnapshot) => {
                         const data = cardSnapshot.id;
                         console.log("data",data);
                        const cardData = cardSnapshot.docs.map((cardDoc) => ({
                            id: cardDoc.id,

                            ...cardDoc.data()
                        }));

                        console.log("待審核卡片資料:", cardData);
                        setCarddata(cardData);
                    });

                    // 解除卡片資料的監聽
                    return () => unsubscribeCard();
                });
            });

            // 解除列表資料的監聽
            return () => unsubscribeList();
        });
    });

    // 在 component 卸載時解除看板資料的監聽
    return () => unsubscribeCanban();
}, [workspaceId]);

    //抓取卡片資料
    React.useEffect(() => {
        console.log("carddata 狀態變化:", carddata);
      }, [carddata]);

    const test =()=>{
        console.log("Carddata",carddata);
    };
  

     
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
                        <Button onClick={() =>handleClickViewCard(card.id)}>查看</Button>
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
                    <Button >確認</Button>
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