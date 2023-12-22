import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Grid, List, Divider, Button, Header, Container } from "semantic-ui-react";
import { FaRegCalendarCheck } from "react-icons/fa6";
import Workspace from "../components/Workspace";
import firebase from "../utils/firebase";
import "firebase/auth";
import Canbanpage from "./Canbanpage";
import styles from "./CardViewArea.module.css";
import SidebarExampleVisible from "./Siderbar";

function CardViewArea() {
    const navigate = useNavigate();
    const [canbandata, setcanbandata] = useState([]);
    const [memberdata, setmemberdata] = useState([]);
    const [upcomingCards, setUpcomingCards] = useState([]);

    const user = firebase.auth().currentUser.uid;
    const location = useLocation();
    const { data } = location.state || {};
    const workspaceId = data?.workid;


    useEffect(() => {
        console.log("Fetching upcoming cards...");

        // 清理上一個workspaceId的資料
        return () => {
            console.log("Cleaning up previous data...");
            // 在這裡執行清理操作，例如重置狀態或取消訂閱
            setmemberdata([]);
            setUpcomingCards([]);
        };
    }, [workspaceId]);

    //抓取人員
    useEffect(() => {
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
        return () => unsubscribe();
    });

    //抓取看板
    useEffect(() => {
        const fetchUpcomingCards = async () => {
            // Step 1: 獲取工作區的所有看板
            const canbanQuery = firebase.firestore().collection('workspace').doc(workspaceId).collection('canban');
            const canbanSnapshot = await canbanQuery.get();

            const upcomingCardsData = [];

            // Step 2: 使用看板ID獲取列表和卡片
            for (const canbanDoc of canbanSnapshot.docs) {
                const canbanId = canbanDoc.id;
                console.log("看板id:", canbanId);
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
    }, [workspaceId]);

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
    useEffect(() => {
        console.log("upcomingCards:", upcomingCards);
    }, [upcomingCards]);

    //點擊待審核職位判斷
    const handleReviewButton = () => {
        console.log("123", user);
        console.log("memberdata:", memberdata);
        // 找到與登入的使用者UID匹配的人員資料
        const member = memberdata.find(member => member.uid === user);
        if (member.position === '管理員') {
            const data = {
                workspaceId: workspaceId,
            };
            navigate('/CardReviewArea', { state: { data } });
        } else {
            alert('使用者不是管理員');
        }
    };

    return (
        <Grid key={data?.workid} className={styles.grid}>
            <Grid.Row className={styles.row}>
                <SidebarExampleVisible />
                <Container className={styles.allboard}>
                    <Grid.Column className={styles.column}>
                        <Container className={styles.container}>
                            <Header className={styles.headeritem}>全部看板進度</Header>
                            <hr className={styles.hr} />
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th className={styles.th}>看板名稱</th>
                                        <th className={styles.thid}>名稱</th>
                                        <th className={styles.thd}>截止時間</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingCards.map((card) => (
                                        <tr key={card.cardId}>
                                            <td className={styles.td}>{card.canbanname}</td>
                                            <td className={styles.tdid}>{card.Cardname}</td>
                                            <td className={styles.tdd}>{card.deadline.toDate().toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Container>
                    </Grid.Column>    
                    <Button className={styles.checkbutton} onClick={handleReviewButton}><FaRegCalendarCheck className={styles.check} /></Button>
                </Container>
            </Grid.Row>
        </Grid>
    )
}

export default CardViewArea;