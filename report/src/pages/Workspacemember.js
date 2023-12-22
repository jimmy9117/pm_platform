import React, { useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Grid, Button, Modal, Header, Container, List } from "semantic-ui-react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import firebase from "../utils/firebase";
import "firebase/auth";
import styles from "./Workspacemember.module.css";
import SidebarExampleVisible from "./Siderbar";


//Ethers.js
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";

function Workspacemember() {
    const navigate = useNavigate();

    const [openworkspace, setOpenWorksapce] = useState(false);//工作區
    const [openkanban, setOpenKanban] = useState(false);//工作區

    const [isLoading, setIsLoading] = React.useState(false);
    const [topics, settopics] = useState([]);
    const [topicsname, settopicsname] = useState("");

    const [workspacename, setworkspacename] = useState("");
    const [workspaceinf, setworkspaceinf] = useState("");


    const [memberdata, setmemberdata] = useState([]);
    const [openAddmember, setOpenAddmember] = useState(false);
    const [openChangePostion, setOpenChangePostion] = useState(false);

    const [inputMemberAddress, setInputMemberAddress] = useState("");

    const user = firebase.auth().currentUser;
    const location = useLocation();
    const { data } = location.state || {};
    
    const workspaceId = data?.workid;
    const [clickQuitModal, setClickQuitModal] = useState(false);
    const [clickRemoveModal, setClickRemoveModal] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectposition, setSelectposition] = useState("");
    const [selectmember, setSelectmember] = useState("");
    const [quitmemberid, setQuitMemberId] = useState("");
    const [removememberid, setRemoveMemberId] = useState("");

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
                        uid: inputMemberAddress,
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
                alert("該成員已存在於工作區中，不允許重複添加。")
                console.log("該成員已存在於工作區中，不允許重複添加。");
            }
        })
            .catch((error) => {
                console.error("查詢成員時出錯:", error);
            });
        setOpenChangePostion(false); // 關閉修改職位視窗
    }

    //取消新增人員
    const CancleAddworkspaceMember = () => {
        setOpenAddmember(false);
        setInputMemberAddress("");
    };

    //新增成員按鈕
    const AddmemberButton = () => {
        console.log("點擊", user.uid);
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
        return () => {
            unsubscribe();
        }
    }, [workspaceId])

    //按下修改按鈕
    const ChangeButton = (uid) => {
        setOpenChangePostion(true);
        setSelectmember(uid);
    };

    const options = [
        { key: 'admin', text: '管理員', value: '管理員' },
        { key: 'member', text: '人員', value: '人員' },
    ];

    //修改職位
    const handlePositionChange = (position) => {
        console.log("test", position);
        setSelectposition(position);
        setIsDropdownOpen(false);
    };

    //處理人員修改
    const upDataMemberPosition = () => {
        const isManager = memberdata.some((member) => member.uid === user.uid && member.position === '管理員');
        const numberOfManagers = memberdata.filter(member => member.position === '管理員').length;
        console.log('管理員人數:', numberOfManagers);
        console.log("修改的人員id:", selectmember);
        if (numberOfManagers < 2 && selectposition === '人員') {
            console.log('工作區至少需要一位管理員');
            alert("工作區至少需要一位管理員!!");
            setOpenChangePostion(false);
            setSelectposition("");
            // 在這裡可以加入相應的提示或處理邏輯
            return;
        }
        if (isManager) {
            const memberRef = firebase.firestore().collection('workspace').doc(workspaceId).collection('member');
            memberRef.where('uid', '==', selectmember).get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        // 找到符合條件的文件
                        const firstMemberDoc = querySnapshot.docs[0];
                        const memberId = firstMemberDoc.id;

                        console.log('人員文件ID:', memberId);
                        // 更新職位
                        return memberRef.doc(memberId).update({ position: selectposition });
                    } else {
                        console.log('找不到符合條件的人員文件');
                    }
                })
                .then(() => {
                    console.log('人員職位更新成功');
                    setOpenChangePostion(false);
                    setSelectposition("");
                })
                .catch((error) => {
                    console.error('查詢人員文件時發生錯誤：', error);
                });

        } else {
            alert("你不是管理員!!");
        }
    };

    //處理人員點擊退出按鈕
    const handleClickQuitButton = (memberid) => {
        setClickQuitModal(true);
        setQuitMemberId(memberid);
    };

    // 處理人員退出
    const handleMemberQuit = () => {
        const memberRef = firebase.firestore().collection("workspace").doc(workspaceId).collection("member");
        const query = memberRef.where("uid", "==", quitmemberid);
        let memberId = "";
        query.get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const firstMemberDoc = querySnapshot.docs[0];
                    memberId = firstMemberDoc.id;
                    const finalMemberRef = memberRef.doc(memberId);
                    console.log("test1:", memberId);
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
                        return memberRef.doc(memberId).delete();

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
                setClickQuitModal(false);
                navigate("/home");
            })
            .catch((error) => {
                console.error("處理退出成員時發生錯誤：", error);
            });
    };

    //點擊移除人員按鈕
    const handleClickRemoveButton = (memberid, position) => {
        const isManager = memberdata.some((member) => member.uid === user.uid && member.position === '管理員');
        console.log("點擊:", position);
        if (isManager) {
            if (position == "管理員") {
                alert("他是管理員!!");
                return;
            }
            setClickRemoveModal(true);
            setRemoveMemberId(memberid);
        } else {
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
                setClickQuitModal(false);
            } else {
                console.log("找不到符合條件的人員文件");
                // 這裡可以根據你的需求處理找不到文件的情況
            }
        } catch (error) {
            console.error("處理退出成員時發生錯誤：", error);
            // 這裡可以根據你的需求處理錯誤情況
        }
        setClickQuitModal(false);
    };

    const test = () => {
        console.log("123", workspaceId);
        console.log("memberdata", memberdata);
    };

    const overlay = (
        <div>
            <div className={styles.overlay} style={{ display: clickQuitModal ? 'block' : 'none' }} onClick={() => setClickQuitModal(false)} />
            <div className={styles.overlay} style={{ display: clickRemoveModal ? 'block' : 'none' }} onClick={() => setClickRemoveModal(false)} />
            <div className={styles.overlay} style={{ display: openAddmember ? 'block' : 'none' }} onClick={() => setOpenAddmember(false)} />
            <div className={styles.overlay} style={{ display: openChangePostion ? 'block' : 'none' }} onClick={() => setOpenChangePostion(false)} />
        </div>
    );

    return (
        <Grid className={styles.grid}>
            {overlay}
            <Grid.Row className={styles.row}>
                <SidebarExampleVisible />
                <Container className={styles.allboard}>
                    <Grid.Column className={styles.column}>
                        <Container className={styles.container}>
                            <Header className={styles.headeritem}>您的工作區成員</Header>
                        </Container>
                        {memberdata.map((member, index) => (
                            <List className={styles.list} key={index}>
                                <hr className={styles.hr} />
                                <List.Item className={styles.listitem}>
                                    UID:
                                    {member.uid}
                                </List.Item>
                                <List.Item className={styles.memberposition}>
                                    {member.position}
                                </List.Item>
                                <Button className={styles.pencilbutton} onClick={() => ChangeButton(member.uid)}>
                                    <HiOutlinePencilAlt className={styles.iconpencil} />
                                </Button>
                                {user.uid === member.uid ? (
                                    <Button className={styles.closebutton} onClick={() => handleClickQuitButton(member.uid)}>
                                        退出
                                    </Button>
                                ) : (
                                    <Button className={styles.closebutton} onClick={() => handleClickRemoveButton(member.uid, member.position)}>
                                        移除
                                    </Button>
                                )}
                            </List>

                        ))}
                        <Container className={styles.buttoncontainer}>
                            <Button className={styles.button} onClick={AddmemberButton}>新增成員</Button>
                        </Container>

                        {/* 退出modal */}
                        <Modal className={styles.leavemodal} onClose={() => setClickQuitModal(false)} open={clickQuitModal}>
                            <Modal.Header className={styles.modalheader}>確認離開工作區嗎？</Modal.Header>
                            <Modal.Description>
                                <Button className={styles.lbutton} onClick={() => handleMemberQuit()} >確認</Button>
                                <Button className={styles.rbutton} onClick={() => setClickQuitModal(false)}>再想想</Button>
                            </Modal.Description>
                        </Modal>

                        {/* 移除modal */}
                        <Modal className={styles.removemodal} onClose={() => setClickRemoveModal(false)} open={clickRemoveModal}>
                            <Modal.Header className={styles.modalheader}>確認將此人移除工作區嗎？</Modal.Header>
                            <Modal.Description>
                                <Button className={styles.lbutton} onClick={() => handleMemberRemove()} >確認</Button>
                                <Button className={styles.rbutton} onClick={() => setClickRemoveModal(false)}>再想想</Button>
                            </Modal.Description>
                        </Modal>

                        {/* 邀請成員視窗 */}
                        <Modal className={styles.addmodal} onClose={() => setOpenAddmember(false)} open={openAddmember}>
                            <Modal.Header className={styles.modalheader}>邀請加入工作區</Modal.Header>

                            <Modal.Description>
                                {/* 完成 Modal 的内容 */}
                                <p></p>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="輸入內容"
                                    value={inputMemberAddress}
                                    onChange={(e) => setInputMemberAddress(e.target.value)}
                                />
                                <Button className={styles.lbutton} onClick={AddworkspaceMember}>加入</Button>
                                <Button className={styles.rbutton} onClick={CancleAddworkspaceMember}>取消</Button>

                            </Modal.Description>
                        </Modal>

                        {/* 修改職位視窗 */}
                        <Modal className={styles.addmodal} onClose={() => setOpenChangePostion(false)} open={openChangePostion}>
                            <Modal.Header className={styles.modalheader}>修改職位</Modal.Header>
                            <Modal.Description>
                                <div className={styles.permissiondrop}>
                                    <div className={styles.permissiondropOption} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                        <span>{selectposition || '選擇職位'}</span>
                                    </div>
                                    <ul className={`${styles.permissiondropdown} ${isDropdownOpen ? styles.open : ''}`}>
                                        {options.map((option) => (
                                            <li
                                                key={option.value}
                                                onClick={() => handlePositionChange( option.value )}
                                            >
                                                {option.text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button className={styles.button} onClick={upDataMemberPosition}>修改</Button>
                            </Modal.Description>
                        </Modal>
                    </Grid.Column>
                </Container>
            </Grid.Row>
        </Grid>
    )
}

export default Workspacemember;