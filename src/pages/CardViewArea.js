import React, { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import { Grid, List,Divider,Button,Icon,Modal,Header, Form,Dropdown } from "semantic-ui-react";
import Workspace from "../components/Workspace";
import firebase from "../utils/firebase";
import "firebase/auth";
import Canbanpage from"./Canbanpage";
import { BsChevronDown } from 'react-icons/bs'; // 這裡引入了 BsChevronDown




function CardViewArea(){
    const navigate = useNavigate();
    const [canbandata,setcanbandata] = useState([]);
    const [memberdata,setmemberdata] = useState([]);
    const user = firebase.auth().currentUser.uid;
    const location = useLocation();
    const workspaceId = location.state.data.workspaceId;
    const [upcomingCards, setUpcomingCards] = useState([]);

    //抓取人員
    React.useEffect(() => {
    // 監聽所有工作區的更改
    const workspacesQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('member');
    
    // 設置監聽器
    const unsubscribe = workspacesQuery.onSnapshot((memberSnapshot) => {
        // 初始化一個陣列，用於存放成員資訊
        const membersArray = [];

        memberSnapshot.docs.forEach((docSnapshot) => {
            const member = docSnapshot.data();
            // console.log("抓到的人員:", member.uid);

            // 將每個成員放入陣列
            membersArray.push(member);
        });

        // 將整個陣列設置為成員資訊
        setmemberdata(membersArray);
    });
    return () =>unsubscribe();
    });

    //抓取看板
    React.useEffect(() => {
        const fetchUpcomingCards = async () => {
          // Step 1: 獲取工作區的所有看板
          const canbanQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban');
          const canbanSnapshot = await canbanQuery.get();
    
          const upcomingCardsData = [];
    
          // Step 2: 使用看板ID獲取列表和卡片
          for (const canbanDoc of canbanSnapshot.docs) {
            const canbanId = canbanDoc.id;
            console.log("看板id:",canbanId);
            const listsQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban').doc(canbanId).collection('list');
            const listsSnapshot = await listsQuery.get();
    
            for (const listDoc of listsSnapshot.docs) {
              const listId = listDoc.id;
                
              const cardsQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban').doc(canbanId).collection('list').doc(listId).collection('card');
              const cardsSnapshot = await cardsQuery.get();
    
              // Step 3: 過濾即將到期的卡片
              cardsSnapshot.forEach(cardDoc => {
                const cardData = cardDoc.data();
                const isUpcoming = isCardUpcoming(cardData);
                if (isUpcoming) {
                  upcomingCardsData.push({ canbanId, listId, cardId: cardDoc.id, ...cardData });
                }
              });
            }
          }
    
          // Step 5: 將結果設置到狀態中
          setUpcomingCards(upcomingCardsData);
        };
    
        fetchUpcomingCards();
      }, []);

    //判斷卡片deadline
    const isCardUpcoming = (card) => {
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
      
        // 注意：如果 card.deadline 是普通 JavaScript 物件，而不是 Timestamp 對象
        // 你可以直接取得 seconds 屬性的值並轉換為毫秒
        const deadlineTimestamp = card.deadline.seconds * 1000;
      
        const currentTimestamp = Date.now();
        return deadlineTimestamp - currentTimestamp < oneDayInMilliseconds;
      };
      

    //監聽快過期卡片數值
    React.useEffect(() => {
        console.log("upcomingCards:", upcomingCards);
    }, [upcomingCards]);
    
    //點擊待審核職位判斷
    const handleReviewButton = () =>{
        console.log("123",user);
        console.log("memberdata:",memberdata);
        // 找到與登入的使用者UID匹配的人員資料
        const member = memberdata.find(member => member.uid === user);
        console.log("抓取到的資料:",member);
        if (member.position === '管理員') {
            console.log('使用者是管理員');
            const data = {
                workspaceId: workspaceId,
              };
              navigate('/CardReviewArea', { state: { data } });
          } else {
            console.log('使用者不是管理員');
            alert("你不是管理員");
          }
    };

    const test=() =>{
    console.log("123",upcomingCards);
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
                        <Button onClick={test}></Button>
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
            <Header>全部看板進度</Header>
            <div>
            
            <ul>
                {upcomingCards.map((card) => (
                <li key={card.cardId}>
                    看板name：{card.canbanname}，卡片ID：{card.cardId}，名稱：{card.Cardname}
                </li>
                ))}
            </ul>
            </div>

            
            </Grid.Column>
            <Grid.Column width={3}>
            <Button onClick={handleReviewButton}>審核區</Button>
            </Grid.Column>
        </Grid.Row>
        
    </Grid>
     {/* 完成 Modal */}
   
    
}

export default CardViewArea;