import React, { useState, useEffect } from "react";
import Workspace from "../components/Workspace";
import firebase from "../utils/firebase";
import "firebase/auth";
import { Grid, List, Divider, Button, Modal, Header, Form, Container, Label } from "semantic-ui-react";
import { useNavigate, Link, useLocation } from "react-router-dom"
import { BiColumns, BiPlus } from 'react-icons/bi';
import { FaHome, FaRegHeart, FaUser } from 'react-icons/fa';
import { HiTemplate } from 'react-icons/hi';
import { BsChevronDown } from 'react-icons/bs';
import { AiOutlineLoading } from "react-icons/ai";
import { MdGridView } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";
import styles from "./Home.module.css";

function SidebarExampleVisible() {

    const navigate = useNavigate();

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

    const location = useLocation();
    const { data } = location.state || {};
    const workid = data?.workspaceid;

    const [openworkspace, setOpenWorksapce] = useState(false); // 控制工作區 Modal 是否打開
    const [isLoading, setIsLoading] = React.useState(false); // 控制提交按鈕的 loading 狀態
    const [topics, settopics] = useState([]); // 存放工作區類型的資料
    const [topicsname, settopicsname] = useState(""); // 存放工作區類型的名稱
    const [workspacename, setworkspacename] = useState(""); // 存放工作區名稱
    const [workspaceinf, setworkspaceinf] = useState(""); // 存放工作區描述
    const [workspace, setworkspace] = useState([]); // 存放所有工作區的資訊
    const [canbandata, setcanbandata] = useState([]);// 存放所有工作區的看板
    const [isDropdownOpen, setDropdownOpen] = useState(false); // 控制Modal下拉選單的打開狀態
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // 控制工作區下拉選單的打開狀態


    // 五個下拉選單導向
    const handleItemClick = (action, wpid, workspacename) => {
        switch (action) {
            case 'dashboard':
                const dashboardData = {
                    workspacename: workspacename,
                    workspaceid: wpid,
                    canbandata: canbandata,
                };
                navigate('/Dashboard', { state: { data: dashboardData } });
                break;
            case 'other':
                // 處理其他點擊
                navigate('/Other');
                break;
            case 'view':
                const viewData = {
                    workid: wpid,
                };
                navigate('/CardViewArea', { state: { data: viewData } });
                break;
            case 'members':
                const membersData = {
                    workid: wpid,
                };
                navigate('/Workspacemember', { state: { data: membersData } });
                break;
            case 'settings':
                const settingsData = {
                    workspacename: workspacename,
                    workspaceid: wpid,
                };
                navigate('/Settings', { state: { data: settingsData } });
                break;
            default:
                break;
        }
    };

    // 打開工作區modal
    const handleIconClick = () => {
        setOpenWorksapce(true);
    };

    // 選擇工作區
    const handleSelectWorkspace = (index) => {
        console.log(index);
        setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    // 選擇公司類型
    const handleDropdownItemClick = (selectedValue) => {
        settopicsname(selectedValue);
        setDropdownOpen(false); // 這裡你可以選擇是否在點擊後自動收起下拉列表
    };


    //工作區類型選擇
    const options = topics.map(topics => {
        return {
            text: topics.name,
            value: topics.name
        }
    })

    const user = firebase.auth().currentUser;

    // 抓取看板 
    React.useEffect(() => {
        const query = firebase.firestore().collection('workspace');

        const handleWorkspaceSnapshot = (workspaceSnapshot) => {
            workspaceSnapshot.docs.forEach((docSnapshot) => {
                const workspaceId = docSnapshot.id;

                const subcollectionQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban');

                const unsubscribe = subcollectionQuery.onSnapshot((subcollectionSnapshot) => {
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
        };

        // 監聽所有工作區的更改
        const unsubscribeWorkspace = query.onSnapshot(handleWorkspaceSnapshot);

        // 在 component 卸載時解除監聽
        return () => {
            unsubscribeWorkspace();
        };
    }, []); // 注意這裡的依賴項是空的，表示只在 component 第一次渲染時執行

    //抓取worktopics 
    useEffect(() => {
        firebase
            .firestore()
            .collection('worktopics')//指定要抓資料的集合
            .get()
            .then((collectionSnapshot) => {//獲得集合快照的物件
                const data = collectionSnapshot.docs.map((doc) => {//獲得文件快照的陣列
                    return doc.data();
                });
                settopics(data);
            });
    }, []);

    useEffect(() => {
        // 抓取工作區
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

        // 抓取看板
        const subscribedWorkspaceIds = [];
        let unsubscribeWorkspace;

        const handleWorkspaceSnapshot = (workspaceSnapshot) => {
            const workspacePromises = workspaceSnapshot.docs.map((docSnapshot) => {
                const workspaceId = docSnapshot.id;

                const subcollectionQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban');

                subscribedWorkspaceIds.push(workspaceId);
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

                    // 在這裡調用 handleItemClick，將看板數據傳遞給目標頁面
                    handleItemClick(subcollectionData);
                    // console.log(subcollectionData)
                });
            });

            // Save all unsubscribe functions in an array
            const unsubscribers = workspacePromises.map((unsubscribeFunc) => unsubscribeFunc);

            unsubscribeWorkspace = () => {
                // Call each unsubscribe function to cancel all listeners
                unsubscribers.forEach((unsubscribeFunc) => unsubscribeFunc());
            };
        };

        // Subscribe to the workspace query
        unsubscribeWorkspace = workspacesQuery.onSnapshot(handleWorkspaceSnapshot);

        return () => {
            // 取消工作區和看板的監聽
            unsubscribeWorkspaces();
            unsubscribeWorkspace();
        };
    }, [user.uid]);


    //按鈕事件 新增工作區
    function onSubmitAddworkspace() {
        setIsLoading(true);
        const doucumentRef = firebase.firestore().collection("workspace").doc();
        doucumentRef.set({
            workspacename: workspacename,
            topics: topicsname,
            content: workspaceinf,
            createdAT: firebase.firestore.Timestamp.now(),
            author: {
                uid: firebase.auth().currentUser.uid,
                photoURL: firebase.auth().currentUser.photoURL || "",
                displayname: firebase.auth().currentUser.displayName || "",
            },
        })
            .then(() => {
                //新增人員文件
                const memberRef = firebase.firestore().collection("workspace").doc(doucumentRef.id).collection("member").doc();
                memberRef.set({
                    uid: firebase.auth().currentUser.uid,
                    createdAT: firebase.firestore.Timestamp.now(),
                    position: "管理員",
                })
                    .then(() => {
                        console.log("成員已添加到工作區");
                    })
                    .catch(error => {
                        console.error("添加成員時出錯:", error);
                    });
                console.log("doucumentRefid:", doucumentRef.id);
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
        <Grid>
            <div className={styles.siderbaroverlay} style={{ display: openworkspace ? 'block' : 'none' }} onClick={() => setOpenWorksapce(false)} />
            <Container className={styles.container}>
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

                    <List className={styles.siderbarlist}>
                        <List.Item className={styles.worklistitem}>
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
                                            <li className={styles.link} onClick={() => handleItemClick('dashboard', post.id, post.workspacename)}>
                                                <BiColumns className={styles.icon2} />看板
                                            </li>
                                            <li className={styles.link} onClick={() => handleItemClick('other')}>
                                                <FaRegHeart className={styles.icon2} />要點
                                            </li>
                                            <li className={styles.link} onClick={() => handleItemClick('view', post.id)}>
                                                <MdGridView className={styles.icon2} />檢視
                                            </li>
                                            <li className={styles.link} onClick={() => handleItemClick('members', post.id)}>
                                                <FaUser className={styles.icon2} />成員
                                            </li>
                                            <li className={styles.link} onClick={() => handleItemClick('settings', post.id, post.workspacename)}>
                                                <IoIosSettings className={styles.icon2} />設定
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </List>

                </Grid.Column>
                {/* 工作區 */}
                <Modal className={styles.modalcontent} onClose={() => setOpenWorksapce(false)} open={openworkspace}>
                    <Modal.Description>
                        <Header className={styles.modalcontentHeader}>讓我們開始打造一個工作區吧</Header>
                        <p>讓大家更容易在同一位置存取看板，以提高你的工作效率。</p>
                        <Form onSubmit={onSubmitAddworkspace}>
                            {/* 工作區名稱 */}
                            <Form.Input
                                label="工作區名稱"
                                placeholder="公司名稱"
                                value={workspacename}
                                onChange={(e) => setworkspacename(e.target.value)}
                            />
                            {/* 工作區類型 */}
                            <Label className={styles.label}>工作區類型</Label>
                            <div className={styles.drop}>
                                <div className={styles.dropOption} onClick={() => setDropdownOpen(!isDropdownOpen)}>
                                    <span>{topicsname || '選擇公司類型'}</span>
                                </div>
                                <ul className={`${styles.dropdown} ${isDropdownOpen ? styles.open : ''}`}>
                                    {options.map((option) => (
                                        <li key={option.value} onClick={() => handleDropdownItemClick(option.value)}>
                                            {option.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {/* 多行內容.TextArea */}
                            <Label className={styles.label}>工作區描述</Label>
                            <textarea
                                className={styles.textArea}
                                placeholder="我們的團隊在此將一切打理的...."
                                value={workspaceinf}
                                onChange={(e) => setworkspaceinf(e.target.value)}
                            ></textarea>
                            <Form.Button
                                className={`${isLoading ? styles.loading : ''}`}
                                loading={isLoading}
                            >
                                {isLoading ? <AiOutlineLoading className={styles.spinner} /> : '送出'}
                            </Form.Button>
                        </Form>
                    </Modal.Description>
                </Modal>
            </Container>
        </Grid>
    );
}

export default SidebarExampleVisible;