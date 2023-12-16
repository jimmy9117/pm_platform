import React, { useState } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import { Grid, List,Divider,Button,Icon,Modal,Header, Form,Dropdown } from "semantic-ui-react";
import firebase from "../utils/firebase";
import "firebase/auth";

import { BsChevronDown } from 'react-icons/bs'; // 這裡引入了 BsChevronDown


//Ethers.js
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";

function Workspacemember(){
    const navigate = useNavigate();
    const [openworkspace, setOpenWorksapce] = useState(false);//工作區
    const [openkanban, setOpenKanban] = useState(false);//工作區

    const [isLoading, setIsLoading] = React.useState(false);
    const [topics,settopics] = useState([]);
    const [topicsname,settopicsname] = useState("");

    const [workspacename, setworkspacename] = useState("");
    const [workspaceinf, setworkspaceinf] = useState("");
    

    const [memberdata,setmemberdata] = useState([]);
    const [openAddmember,setOpenAddmember] = useState(false);
    const [openChangePostion, setOpenChangePostion] = useState(false);

    const [inputMemberAddress,setInputMemberAddress] = useState("");

    const user = firebase.auth().currentUser;
    const location = useLocation();
    const workspaceId = location.state.data.workspaceId;

    // 按鈕事件 新增工作區人員
    function AddworkspaceMember() {
        // 新增人員文件
        const memberQuery = firebase
        .firestore()
        .collection("workspace")
        .doc(workspaceId)
        .collection("member")
        .where("uid", "==", inputMemberAddress);
    
        memberQuery.get().then((querySnapshot) => {
            if (querySnapshot.empty) {
            const memberRef = firebase
                .firestore()
                .collection("workspace")
                .doc(workspaceId)
                .collection("member")
                .doc();
    
            memberRef
                .set({
                uid:inputMemberAddress,
                createdAT: firebase.firestore.Timestamp.now(),
                position: "人員",
                })
                .then(() => {
                console.log("成員已添加到工作區");
                setOpenAddmember(false);
                setInputMemberAddress("");
                })
                .catch((error) => {
                console.error("添加成員時出錯:", error);
                });
            } else {
            console.log("該成員已存在於工作區中，不允許重複添加。");
            }
        })
        .catch((error) => {
            console.error("查詢成員時出錯:", error);
        });
    }
    
    //取消新增人員
    const CancleAddworkspaceMember = () =>{
        setOpenAddmember(false);
        setInputMemberAddress("");
    };

    //新增成員按鈕
    const AddmemberButton = () =>{
        console.log("點擊");
        setOpenAddmember(true);
    };

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
    
    //按下修改按鈕
    const ChangeButton = () =>{
        setOpenChangePostion(true)
    };
    //修改職位
    const handlePositionChange = (uid,position) =>{
        console.log("test");
        
    };

     const test=() =>{
        console.log("123",workspaceId);
        console.log("memberdata",memberdata);

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
            <Header>您的工作區成員</Header>
            {memberdata.map((member, index) => (
                <div key={index}>
                    <p>
                    UID: {member.uid} Position: {member.position}  </p>
                    <Button onClick={()=>ChangeButton(member.uid)}></Button>
                </div>
            ))}
            <Button onClick={AddmemberButton}>新增成員</Button>
               {/* 邀請成員視窗 */}
                <Modal size="mini" onClose={()=>setOpenAddmember(false)} open={openAddmember}>
                <Modal.Header>邀請加入工作區</Modal.Header>
                
                <Modal.Description>
                {/* 完成 Modal 的内容 */}
                <p></p>
                <input
                    type="text"
                    placeholder="输入内容"
                    value={inputMemberAddress}
                    onChange={(e) => setInputMemberAddress(e.target.value)}
                    />
                <Button onClick={AddworkspaceMember}>加入</Button>    
                <Button onClick={CancleAddworkspaceMember}>取消</Button>    

                </Modal.Description>
                </Modal>
               {/* 修改職位視窗 */}
                <Modal size="mini" onClose={()=>setOpenChangePostion(false)} open={openChangePostion}>
                <Modal.Header>修改職位</Modal.Header>
                <Modal.Description>
                <Dropdown
                    placeholder="更改"
                    selection
                    options={[
                        { key: 'admin', text: '管理員', value: 'admin' },
                        { key: 'member', text: '成員', value: 'member' },
                    ]}
                    onChange={(event, data) => handlePositionChange( data.value)}
                    style={{ minWidth: '100px' }} // 設置最小寬度
                    />
                <Button onClick={AddworkspaceMember}></Button>          
                </Modal.Description>
                </Modal>

            
            </Grid.Column>
            <Grid.Column width={3}>右空白
            
            </Grid.Column>
        </Grid.Row>
        
    </Grid>
     {/* 完成 Modal */}
   
    
}

export default Workspacemember;