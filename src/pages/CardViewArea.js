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
})
    
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
        console.log("123",workspaceId);
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
            

            
            </Grid.Column>
            <Grid.Column width={3}>
            <Button onClick={handleReviewButton}>審核區</Button>
            </Grid.Column>
        </Grid.Row>
        
    </Grid>
     {/* 完成 Modal */}
   
    
}

export default CardViewArea;