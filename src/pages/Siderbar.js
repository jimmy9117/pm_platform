import React, { useState, useEffect } from "react";
import Workspace from "../components/Workspace";
import firebase from "../utils/firebase";
import "firebase/auth";
import { Grid, List, Divider, Button, Modal, Header, Form, Container } from "semantic-ui-react";
import { useNavigate, Link } from "react-router-dom"
import { BiColumns, BiPlus } from 'react-icons/bi';
import { FaHome } from 'react-icons/fa';
import { HiTemplate } from 'react-icons/hi';
import { BsChevronDown } from 'react-icons/bs';
import styles from "./Home.css";

function SidebarExampleVisible({ setSelectedWorkspace }) {

    const navigate = useNavigate();

    const [openworkspace, setOpenWorksapce] = useState(false);//工作區
    const [isLoading, setIsLoading] = React.useState(false);
    const [topics, settopics] = useState([]);
    const [topicsname, settopicsname] = useState("");
    const [workspacename, setworkspacename] = useState("");
    const [workspaceinf, setworkspaceinf] = useState("");
    const [workspace, setworkspace] = React.useState([]);
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // 工作區選單

    const handleIconClick = () => {
        setOpenWorksapce(true);
    };

    const handleSelectWorkspace = (index) => {
        console.log('點選工作區:');
        console.log(workspace);
        console.log('點選工作區:', index);
        setOpenDropdownIndex(openDropdownIndex === index ? null : index);
    };

    //點擊工作區看板
    const handleLinkClick = (index) => {
        const selectedWorkspace = workspace[index];
        if (selectedWorkspace) {
            if (typeof setSelectedWorkspace === 'function') {
                setSelectedWorkspace(selectedWorkspace.workspacename);
                console.log(selectedWorkspace.workspacename);
            } else {
                console.error('setSelectedWorkspace is not a function');
            }
        }
    };

    //工作區類型選擇
    const options = topics.map(topics => {
        return {
            text: topics.name,
            value: topics.name
        }
    })

    const user = firebase.auth().currentUser;

    //抓取worktopics 
    React.useEffect(() => {
        firebase
            .firestore()
            .collection('worktopics')//指定要抓資料的集合
            .get()
            .then((collectionSnapshot) => {//獲得集合快照的物件
                const data = collectionSnapshot.docs.map((doc) => {//獲得文件快照的陣列
                    return doc.data();
                });
                console.log("工作區類別:", data);
                settopics(data);
            });
    }, []);

    //抓取workspace
    React.useEffect(() => {
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

   //按鈕事件 新增工作區
   function onSubmitAddworkspace(){
    setIsLoading(true);
    const doucumentRef = firebase.firestore().collection("workspace").doc();
    doucumentRef.set({
      workspacename:workspacename,
      topics:topicsname,
      content:workspaceinf,
      createdAT:firebase.firestore.Timestamp.now(),
      author:{
        uid:firebase.auth().currentUser.uid,
        photoURL:firebase.auth().currentUser.photoURL || "",
        displayname:firebase.auth().currentUser.displayName || "",
      },
    })
    .then(() => {
      //新增人員文件
      const memberRef = firebase.firestore().collection("workspace").doc(doucumentRef.id).collection("member").doc();
      memberRef.set({
        uid:firebase.auth().currentUser.uid,
        createdAT:firebase.firestore.Timestamp.now(),
      })
      .then(() => {
        console.log("成員已添加到工作區");
      })
      .catch(error => {
        console.error("添加成員時出錯:", error);
      });
      console.log("doucumentRefid:",doucumentRef.id);
      // 重置狀態並導航
      setIsLoading(false);
      setOpenWorksapce(false); // 關閉 Modal
      setworkspacename('');
      settopicsname('');
      setworkspaceinf('');
      navigate("/home");
    });
  }

    return (

        <Container className={styles.container}>
            <div className={styles.overlay} style={{ display: openworkspace ? 'block' : 'none' }} onClick={() => setOpenWorksapce(false)} />
            <Grid.Column className={styles.column}>
                <List animated selection className={styles.list}>
                    <List.Item className={styles.item} as={Link} to="/home">
                        <BiColumns className={styles.icon} />看板
                    </List.Item>
                    <List.Item className={styles.item}>
                        <HiTemplate className={styles.icon} />範本
                    </List.Item>
                    <List.Item className={styles.item}>
                        <FaHome className={styles.icon} />首頁
                    </List.Item>
                    <Divider />
                </List>

                <List className={styles.list1}>
                    <List.Item className={styles.listitem1}>
                        工作區
                        <Button className={styles.button} floated="right" onClick={handleIconClick}>
                            <BiPlus className={styles.icon} />
                        </Button>
                    </List.Item>
                    {workspace.map((post, index) => (
                        <React.Fragment key={post.id}>
                            <List.Item
                                className={styles.listitem}
                                onClick={() => handleSelectWorkspace(index)}
                            >
                                {post.workspacename} <BsChevronDown className={`${styles.icon1} ${styles.chevron} ${openDropdownIndex === index ? styles.open : ''}`} />
                            </List.Item>
                            {openDropdownIndex === index && (
                                <div className={styles.dropdownMenu}>
                                    <ul className={styles.dropdownList}>
                                        <Link as={Link} to="/Dashboard" onClick={() => handleLinkClick(index)}>
                                            <li>
                                                看板
                                            </li>
                                        </Link>

                                        <Link as={Link} to="/Other">
                                            <li>
                                                要點
                                            </li>
                                        </Link>
                                        <li>檢視</li>
                                        <li>成員</li>
                                        <li>設定</li>
                                    </ul>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </List>
                <Workspace setSelectedWorkspace={setSelectedWorkspace} />
            </Grid.Column>

            {/* 工作區 */}
            <Modal className={styles.modalcontent} onClick={() => setOpenWorksapce(true)} open={openworkspace}>
                <Modal.Description>
                    <Header className={styles.modalcontentHeader}>讓我們開始打造一個工作區吧</Header>
                    <p>讓大家更容易在同一位置存取看板，以提高你的工作效率。</p>
                    <Form onSubmit={onSubmitAddworkspace}>
                        <Form.Input
                            label="工作區名稱"
                            placeholder="公司名稱"
                            value={workspacename}
                            onChange={(e) => setworkspacename(e.target.value)}
                        />
                        {/* Form.Dropdown提供一個參數，會有個物件value的key，再把他set回topicsanme */}
                        <Form.Dropdown
                            label="工作區類型"
                            placeholder="選擇公司類型"
                            options={options}
                            selection
                            value={topicsname}
                            onChange={(e, { value }) => settopicsname(value)}
                            className={styles.modalcontentSelect}
                        />
                        {/* 多行內容.TextArea */}
                        <Form.TextArea
                            label="工作區描述"
                            size="big"
                            placeholder="我們的團隊在此將一切打理的...."
                            value={workspaceinf}
                            onChange={(e) => setworkspaceinf(e.target.value)}
                            className={styles.textArea}
                        />
                        <Form.Button loading={isLoading}>送出</Form.Button>
                    </Form>
                </Modal.Description>
            </Modal>
        </Container>
    );
}

export default SidebarExampleVisible;