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
    const [clickQuitModal,setClickQuitModal] = useState(false);
    const [clickRemoveModal,setClickRemoveModal] = useState(false);
    const [quitmemberid,setQuitMemberId] = useState("");
    const [removememberid,setRemoveMemberId] = useState("");

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
        console.log("點擊",user.uid);
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
    //處理人員點擊退出按鈕
    const handleClickQuitButton = (memberid) =>{
        setClickQuitModal(true);
        setQuitMemberId(memberid);
    };

    // 處理人員退出
    const handleMemberQuit = () => {
        const memberRef = firebase.firestore().collection("workspace").doc(workspaceId).collection("member");
        const query = memberRef.where("uid", "==", quitmemberid);
    
        query.get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const firstMemberDoc = querySnapshot.docs[0];
                    const memberId = firstMemberDoc.id;
                    const finalMemberRef = memberRef.doc(memberId);
    
                    return finalMemberRef.get();
                } else {
                    console.log("找不到符合條件的人員文件");
                    return Promise.reject("找不到符合條件的人員文件");
                }
            })
            .then((doc) => {
                if (doc.exists) {
                    const memberData = doc.data();
                    const isManager = memberData.position === '管理員';
                    
                    if (isManager) {
                        return firebase.firestore().collection("workspace").doc(workspaceId).collection("member").where("position", "==", "管理員").get();
                    } else {
                        return Promise.resolve(); // 不是管理員，直接執行退出操作
                    }
                } else {
                    console.log("成員不存在");
                    return Promise.reject("成員不存在");
                }
            })
            .then((querySnapshot) => {
                if (querySnapshot && querySnapshot.size === 1) {
                    console.log("這是唯一的管理員，無法退出");
                    alert("你是唯一管理員!!");
                    setClickQuitModal(false);
                    return Promise.reject("這是唯一的管理員，無法退出");
                } else {
                    // 不是唯一的管理員，執行退出操作
                    return memberRef.doc(quitmemberid).delete();
                }
            })
            .then(() => {
                console.log("成員已成功刪除");
                setQuitMemberId("");
            })
            .catch((error) => {
                console.error("處理退出成員時發生錯誤：", error);
            });
    };

    //點擊移除人員按鈕
    const handleClickRemoveButton =(memberid,position)=>{
        const isManager = memberdata.some((member) => member.uid === user.uid  && member.position === '管理員');
        console.log("點擊:",position);
        if(isManager){
            if(position == "管理員"){
                alert("他是管理員!!");
                return;
            }
            setClickRemoveModal(true);
            setRemoveMemberId(memberid);
        }else{
            alert("你不是管理員!!");
        }  
    };


    // 處理移除人員
    const handleMemberRemove = async () => {
        try {
            const memberRef = firebase.firestore().collection("workspace").doc(workspaceId).collection("member");

            // 使用 where 條件找到要移除的成員
            const querySnapshot = await memberRef.where("uid", "==", removememberid).get();

            if (!querySnapshot.empty) {
                // 找到符合條件的第一個文件
                const firstMemberDoc = querySnapshot.docs[0];
                const memberId = firstMemberDoc.id;

                // 刪除該成員
                await memberRef.doc(memberId).delete();

                console.log("成員已成功刪除");
                setRemoveMemberId("");
                setClickRemoveModal(false);
            } else {
                console.log("找不到符合條件的人員文件");
                // 這裡可以根據你的需求處理找不到文件的情況
            }
        } catch (error) {
            console.error("處理退出成員時發生錯誤：", error);
            // 這裡可以根據你的需求處理錯誤情況
        }
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
                        UID: {member.uid} Position: {member.position}  
                        <Button onClick={()=>ChangeButton(member.uid)}>修改</Button>
                       
                        {user.uid === member.uid ? (
                            <Button onClick={()=>handleClickQuitButton(member.uid)}>退出</Button>
                        ) : (
                            <Button onClick={()=>handleClickRemoveButton(member.uid,member.position)}>移除</Button>
                        )}
                    </p>
                </div>
            ))}
            {/* 退出modal */}
            <Modal size="mini" onClose={()=>setClickQuitModal(false)} open={clickQuitModal}>
                    <Modal.Header>確認離開工作區嗎</Modal.Header>
                    <Modal.Description>
                    <Button onClick={()=>handleMemberQuit()} >確認</Button>
                    <Button onClick={()=>setClickQuitModal(false)}>再想想</Button>
                    </Modal.Description>
                </Modal>
            {/* 移除modal */}
            <Modal size="mini" onClose={()=>setClickRemoveModal(false)} open={clickRemoveModal}>
                    <Modal.Header>確認將此人移除工作區嗎</Modal.Header>
                    <Modal.Description>
                    <Button onClick={()=>handleMemberRemove()} >確認</Button>
                    <Button onClick={()=>setClickRemoveModal(false)}>再想想</Button>
                    </Modal.Description>
                </Modal>
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
                    placeholder="職位"
                    selection
                    options={[
                        { key: 'admin', text: '管理員', value: 'admin' },
                        { key: 'member', text: '成員', value: 'member' },
                    ]}
                    onChange={(event, data) => handlePositionChange( data.value)}
                    style={{ minWidth: '100px' }} // 設置最小寬度
                    />
                <Button onClick={AddworkspaceMember}>修改</Button>          
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