import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Grid, List, Button, Modal, Header, Form, Container, Label } from "semantic-ui-react";
// import 'semantic-ui-css/semantic.min.css';
import firebase from "../utils/firebase";
import "firebase/auth";
import { BiPlus } from 'react-icons/bi';
import { AiOutlineLoading } from "react-icons/ai";
import styles from "./Home.module.css";
import SidebarExampleVisible from "./Siderbar";
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";

function Home() {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [openkanban, setOpenKanban] = useState(false);//工作區
  const [isCanbanDropdownOpen, setCanbanDropdownOpen] = useState(false);//看板modal選單
  const [isPermissionsDropdownOpen, setPermissionsDropdownOpen] = useState(false);//權限modal選單

  const [isLoading, setIsLoading] = useState(false);

  const [workspace, setworkspace] = useState([]);
  const [workspaceid, setworkspaceid] = useState("0X");//不能設空字串 

  const [canbanname, setcanbanname] = useState("");
  const [canbanoption, setcanbanoption] = useState("");
  const [canbandata, setcanbandata] = useState([]);//將獲取到的看板資訊設置到裡面

  const [permissions, setpermissions] = useState([]);
  const [permissionsname, setpermissionsname] = useState("");

  // 初始化 ethers.js 和智能合约
  const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const cardStorageContract = new Contract(contractAddress, contractABI, signer);
  const contractInterface = new Interface(contractABI);

  const dropdownOptions = [
    { key: 'view', text: '檢視', value: 'view' },
    { key: 'members', text: '成員', value: 'members' },
  ];

  const handleCanbanoptionDropdownItemClick = (value) => { // 選擇看板
    setcanbanoption(value);
    setCanbanDropdownOpen(false); // 關閉看板下拉選單
    setPermissionsDropdownOpen(false); // 關閉權限下拉選單
  };

  const handlePermissionDropdownItemClick = (value) => { // 選擇權限
    setpermissionsname(value);
    setPermissionsDropdownOpen(false); // 關閉權限下拉選單
    setCanbanDropdownOpen(false); // 關閉看板下拉選單
  }


  //選取看板處理 
  const handleSelectCanban = (item) => {
    console.log("點選到看板id", item.id);
    console.log("獲取到workspaceid", item.workspaceId);
    console.log("點選到看板name", item.canbanname);

    // 創建要傳遞的數據對象
    const data = {
      clickcanbanid: item.id,
        clickcanbanname: item.canbanname,
        clickworkspaceid: item.workspaceId,
    };

    // 導航到 Canbanpage 並傳遞數據
    navigate('/Canbanpage', { state: { data } });
  };


  const handleKanbanclick = (id) => {
    console.log('handleKanbanclick called');
    setOpenKanban(true);
    console.log('點擊的文件 id:', id);
    setworkspaceid(id);
    console.log('testid', workspaceid);
  };


  //工作區選擇
  const wsoptions = workspace.map(workspace => {
    return {
      text: workspace.workspacename,
      value: workspace.workspacename
    }
  })

  //權限選擇 
  const permissionsoption = permissions.length > 0 ? permissions.map(permissions => ({
    text: permissions.name,
    value: permissions.name
  })) : [];


  const user = firebase.auth().currentUser;

  //抓取permissions
  useEffect(() => {
    firebase
      .firestore()
      .collection('permissions')//指定要抓資料的集合
      .get()
      .then((collectionSnapshot) => {//獲得集合快照的物件
        const data = collectionSnapshot.docs.map((doc) => {//獲得文件快照的陣列
          return doc.data();
        });
        setpermissions(data);
      });
  }, []);

  //抓取workspace
  useEffect(() => {
    // 監聽所有工作區的更改
    const workspacesQuery = firebase.firestore().collection('workspace');
    const unsubscribeWorkspaces = workspacesQuery.onSnapshot((workspaceSnapshot) => {
      const workspaceDataPromises = workspaceSnapshot.docs.map((workspaceDoc) => {
        const workspaceId = workspaceDoc.id;
        const workspaceData = workspaceDoc.data();

        // 對每個工作區的成員集合進行監聽
        const membersQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('member');
        return membersQuery.where('uid', '==', user.uid).onSnapshot((memberSnapshot) => {
          if (!memberSnapshot.empty) {
            // 如果用戶是成員，更新工作區數據
            setworkspace((prevWorkspaces) => {
              const isExistingWorkspace = prevWorkspaces.some(w => w.id === workspaceId);
              if (!isExistingWorkspace) {
                return [...prevWorkspaces, { ...workspaceData, id: workspaceId }];
              }
              return prevWorkspaces;
            });
          }
        });
      });

      Promise.all(workspaceDataPromises).then(() => {
        console.log("工作區資料更新完成");
      });
    });

    return () => {
      // 取消工作區的監聽
      unsubscribeWorkspaces();
    };
  }, [user.uid]);

  // 抓取看板 
  useEffect(() => {
    const query = firebase.firestore().collection('workspace');
    const subscribedWorkspaceIds = [];
    let unsubscribeWorkspace;

    const handleWorkspaceSnapshot = (workspaceSnapshot) => {
      const workspacePromises = workspaceSnapshot.docs.map((docSnapshot) => {
        const workspaceId = docSnapshot.id;

        const memberQuery = firebase.firestore().collection("workspace").doc(workspaceId).collection("member");

        return memberQuery.get().then((memberSnapshot) => {
          const isMember = memberSnapshot.docs.some((memberDoc) => memberDoc.data().uid === user.uid);
          if (isMember) {
            subscribedWorkspaceIds.push(workspaceId);
          }
        });
      });

      Promise.all(workspacePromises).then(() => {
        const subcollectionPromises = subscribedWorkspaceIds.map((id) => {
          const subcollectionQuery = firebase.firestore().collection('workspace').doc(id).collection('canban');

          return subcollectionQuery.onSnapshot((subcollectionSnapshot) => {
            const subcollectionData = subcollectionSnapshot.docs.map((subDocSnapshot) => {
              const subDocId = subDocSnapshot.id;
              const subDocData = subDocSnapshot.data();
              return { id: subDocId, ...subDocData };
            });

            setcanbandata((prevData) => {
              const newData = subcollectionData.filter(
                (item) => !prevData.some((existingItem) => existingItem.id === item.id)
              );

              return [...prevData, ...newData];
            });
          });
        });

        // Save all unsubscribe functions in an array
        const unsubscribers = subcollectionPromises.map((unsubscribeFunc) => unsubscribeFunc);

        unsubscribeWorkspace = () => {
          // Call each unsubscribe function to cancel all listeners
          unsubscribers.forEach((unsubscribeFunc) => unsubscribeFunc());
        };
      });
    };

    // Subscribe to the workspace query
    unsubscribeWorkspace = query.onSnapshot(handleWorkspaceSnapshot);

    return () => {
      // Unsubscribe from the workspace query
      unsubscribeWorkspace();
    };
  }, [user.uid]);

  // 在組件開始渲染時標記 mountedRef 為 true
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      // 在組件卸載時標記 mountedRef 為 false
      mountedRef.current = false;
    };
  }, []);



  useEffect(() => {
    console.log("canbandata 狀態變化:", canbandata);
    // 在這裡處理你希望在 canbandata 變化時執行的操作
  }, [canbandata]);

  //按鈕事件 新增看板
  function onSubmitAddcanban() {
    setIsLoading(true);
    console.log("看板名:", canbanname);
    console.log("看板選擇:", canbanoption);
    console.log("權限選擇:", permissionsname);

    const doucumentRef = firebase.firestore().collection("workspace").doc(workspaceid).collection("canban").doc();
    doucumentRef.set({
      workspaceId: workspaceid,
      canbanname: canbanname,
      canbanoption: canbanoption,
      permissions: permissionsname,
      createdAT: firebase.firestore.Timestamp.now(),
      author: {
        uid: firebase.auth().currentUser.uid,
        photoURL: firebase.auth().currentUser.photoURL || "",
        displayname: firebase.auth().currentUser.displayName || "",
      },
    })
      .then(() => {
        setIsLoading(false);
        setOpenKanban(false); // 關閉 Modal
        setcanbanname('');
        setcanbanoption('');
        setpermissions('');
        navigate("/home");
      });
  }

  return (
    <Grid className={styles.grid}>
      <div className={styles.Homeoverlay} style={{ display: openkanban ? 'block' : 'none' }} onClick={() => setOpenKanban(false)} />

      <Grid.Row className={styles.row}>

        <SidebarExampleVisible />

        <Container className={styles.rightcontainer}>
          <Grid.Column>
            <Header className={styles.headeritem}>您的工作區</Header>
            {workspace.map(({ id: workspaceId, workspacename }, index) => (
              <div key={index}>
                <Header className={styles.litlteheaderitem}>{workspacename}</Header>
                <List>
                  <Button className={styles.rightbutton} onClick={() => handleKanbanclick(workspaceId)} >
                    <BiPlus className={styles.icon} />
                  </Button>
                </List>

                <List className={styles.canband} animated selection>
                  {canbandata
                    .filter((item) => item.workspaceId === workspaceId)
                    .map((item) => (
                      <List.Item className={styles.canbandname} key={item.id} onClick={() => handleSelectCanban(item)}>
                        {item.canbanname}
                      </List.Item>
                    ))}
                </List>
              </div>
            ))}
          </Grid.Column>
        </Container>
      </Grid.Row>

      {/* 看板 */}
      <Modal className={styles.modal} onClose={() => setOpenKanban(false)} open={openkanban}>
        <Modal.Description>
          <Header className={styles.modalHeader}>建立看板</Header>
          <p></p>
          <Form onSubmit={onSubmitAddcanban}>
            <Form.Input
              label="卡片名稱"
              placeholder="卡片名稱"
              value={canbanname}
              onChange={(e) => setcanbanname(e.target.value)}
            />
            {/* Form.Dropdown提供一個參數，會有個物件value的key，再把他set回topicsanme */}
            {/* 工作區選擇 */}
            <Label className={styles.label}>工作區</Label>
            <div className={styles.workspacedrop}>
              <div className={styles.workspacedropOption} onClick={() => setCanbanDropdownOpen(!isCanbanDropdownOpen)}>
                <span>{canbanoption || '選擇工作區'}</span>
              </div>
              <ul className={`${styles.workspacedropdown} ${isCanbanDropdownOpen ? styles.open : ''}`}>
                {wsoptions.map((option) => (
                  <li key={option.value} onClick={() => handleCanbanoptionDropdownItemClick(option.value)}>
                    {option.text}
                  </li>
                ))}
              </ul>
            </div>
            {/* 權限 */}
            <Label className={styles.label}>查看權限</Label>
            <div className={styles.permissiondrop}>
              <div className={styles.permissiondropOption} onClick={() => setPermissionsDropdownOpen(!isPermissionsDropdownOpen)}>
                <span>{permissionsname || '選擇權限'}</span>
              </div>
              <ul className={`${styles.permissiondropdown} ${isPermissionsDropdownOpen ? styles.open : ''}`}>
                {permissionsoption.map((option) => (
                  <li key={option.value} onClick={() => handlePermissionDropdownItemClick(option.value)}>
                    {option.text}
                  </li>
                ))}
              </ul>
            </div>
            <Form.Button
              className={`${isLoading ? styles.loading : ''}`}
              loading={isLoading}
            >
              {isLoading ? <AiOutlineLoading className={styles.spinner} /> : '建立'}
            </Form.Button>
          </Form>
        </Modal.Description>
      </Modal>
    </Grid>
  );
}

export default Home;