import React, { useState, useEffect, } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Sidebar, Button, Modal, Header, Container, Menu, Image, Segment } from 'semantic-ui-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Droppable } from './Droppable';
import { Draggable } from './Draggable';
import { BiPlus, BiColumns } from 'react-icons/bi';
import { FaUser } from "react-icons/fa";
import blob from "../image/blob.png";
import styles from './Canbanpage.module.css';
import CanbanHeader from './CanbanHeader';
import firebase from "../utils/firebase";
import "firebase/auth";

//Ethers.js
import contractABI from '../contracts/CompanySstorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Canbanpage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data } = location.state || {};
  const workid = data?.workspaceid;
  const [visible, setVisible] = React.useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(null);
  const [listName, setListName] = useState(''); // 用于存储输入的列表名称
  const [cardName, setcardName] = useState('');
  const [workspaceid, setworkspaceid] = useState("");
  const [canbanid, setcanbanid] = useState("");
  const [canbanname, setcanbanname] = useState("");
  const [listdata, setlistdata] = React.useState([]);
  const [carddata, setcarddata] = React.useState([]);
  const [temporaryCardData, setTemporaryCardData] = useState([...carddata]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [dragStartIndex, setDragStartIndex] = useState(null);
  //點擊卡片判斷
  const [openCard, setOpenCard] = useState(false);
  const [openFinishModal, setOpenFinishModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [memberdata, setmemberdata] = useState([]);

  //卡片Modal判斷
  const [isAddingInModal, setIsAddingInModal] = useState(false);
  const [modalInputValue, setModalInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isDropdownOpen, setDropdownOpen] = useState(false);//權限modal選單
  const [message, setMessage] = useState(null);
  const [daymessage,setdayMessage] = useState(null)

  // 初始化 ethers.js 和智能合约
  const contractAddress = '0x12FE2F9f9BA95189F26990051dCf3c3272b4D044';
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const cardStorageContract = new Contract(contractAddress, contractABI, signer);

  //dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  //側邊攔切換畫面
  const handleItemClick = (item) => {
    // 根據 'item' 值處理不同的菜單項目
    switch (item) {
      case 'home':
        navigate('/Home');
        console.log('點擊首頁菜單項目');
        break;
      case 'dashboard':
        const dashboardData = {
        };
        console.log(dashboardData)
        navigate('/Dashboard', { state: { data: { dashboardData } } });
        break;
      case 'members':
        navigate('/Workspacemember', { state: { data: { workid: workspaceid } } });
        break;
      default:
        // 處理默認情況或意外的值
        console.warn(`未處理的菜單項目：${item}`);
    }


    // 如果需要，可以關閉側邊欄或執行其他操作
    setVisible(false);
  };

  //側邊攔開關
  const handleIconClick = () => {
    setVisible(!visible);
    setIsActive(!isActive);
  };

  //工作區人員資料
  const memberoptions = memberdata.map(member => ({
    text: member.uid,
    value: member.uid,
  }));

  // 检查 data 是否存在
  if (data && !workspaceid && !canbanid) {
    const clickcanbanid = data.clickcanbanid;
    const clickcanbanname = data.clickcanbanname;
    const clickworkspaceid = data.clickworkspaceid;
    setworkspaceid(clickworkspaceid);
    setcanbanid(clickcanbanid);
    setcanbanname(clickcanbanname);
  }


  //新增列表按鈕
  const handleAddList = () => {
    setIsAddingList(true);
  };

  // 新增卡片按鈕
  const handleAddCard = (listIndex) => {
    console.log(listIndex, "test");

    if (isAddingCard === listIndex) {
      // 如果点击的是已经展开的列表，则关闭它
      setIsAddingCard(null);
    } else {
      // 否则，展开点击的列表
      setIsAddingCard(listIndex);
    }
  };

  //取消新增列表按鈕 
  const cancelListNameSubmit = () => {
    setIsAddingList(false);
  };

  //點擊Modal描述
  const handleCardDescribe = (CardId) => {
    setIsAddingInModal(true);
  };

  //確認ModalDescribe送出
  const handleDescriptSent = (CardId) => {
    console.log("點擊卡片", CardId);

    const cardQuery = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(CardId);

    cardQuery.update({
      describe: modalInputValue
    })
      .then(() => {
        console.log("卡片描述信息已更新");
        setIsAddingInModal(false);
        setModalInputValue("");
      })
      .catch(error => {
        console.error("更新卡片描述信息时出错:", error);
      });
  }
  //取消Modal描述
  const handleCancelInModal = () => {
    setIsAddingInModal(false);
    setModalInputValue("");
  };

  //取消新增卡片按鈕 
  const cancelCardNameSubmit = () => {
    setIsAddingCard(null);
  };

  //保存日期
  const handleSaveDate = () => {
    setdayMessage("※日期已被保存！");
    console.log("");
    if (!selectedDate) {
      alert("请先选择一个日期。");
      return;
    }
    const cardRef = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(selectedCardId);

    // 更新 deadline
    cardRef.update({
      deadline: selectedDate
    })
      .then(() => {
        console.log("卡片的 deadline 已成功更新");
        setSelectedDate("");
      })
      .catch((error) => {
        console.error("更新卡片的 deadline 時出現錯誤：", error);
      });
      setTimeout(() => {
        setdayMessage(null);
      }, 3000);
  }

  //送出完成按鈕
  const handleFinish = () => {
    setOpenFinishModal(true);
  }

  //確認送出完成卡片
  const handleSentCard = () => {
    const cardRef = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(selectedCardId);

    cardRef.update({
      state: "待審核"
    })
      .then(() => {
        console.log("卡片已成功送出");
        setOpenCard(false)
        setOpenFinishModal(false);
        // 手動更新卡片數據的狀態
        setcarddata((prevData) =>
          prevData.map((card) =>
            card.id === selectedCardId ? { ...card, state: "待審核" } : card
          )
        );
      })
      .catch((error) => {
        console.error("卡片的狀態已更新時出現錯誤：", error);
      });
  }

  //取消送出卡片
  const cancelCardSent = () => {
    setOpenFinishModal(false);
  }

  //新增卡片人員按鈕
  const handleAddcardMembers = (userid) => {
    setMessage("※成員已被新增！");
    console.log("Addcardmember", userid);
    const cardRef = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(selectedCardId);

    // 更新 deadline
    cardRef.update({
      member: firebase.firestore.FieldValue.arrayUnion(userid)
    })
      .then(() => {
        console.log("卡片的member已添加成功");
      })
      .catch((error) => {
        console.error("更新卡片的member時出現錯誤：", error);
      });
    setTimeout(() => {
      setMessage(null);
    }, 3000);
    setDropdownOpen(false);
  };

  //新增列表
  const handleListNameSubmit = () => {
    // 查询是否有具有相同名字的列表
    const listQuery = firebase
      .firestore()
      .collection('workspace')
      .doc(workspaceid)
      .collection('canban')
      .doc(canbanid)
      .collection('list')
      .where('Listname', '==', listName); // 检查与当前输入的 listName 相同的列表

    listQuery.get().then((querySnapshot) => {
      if (querySnapshot.empty) {
        // 没有重复的数据，可以添加
        console.log('clickcanbanid 值是：', canbanid);
        console.log('clickworkspaceid 值是：', workspaceid);
        setIsLoading(true);

        const doucumentRef = firebase.firestore().collection("workspace").doc(workspaceid).collection("canban").doc(canbanid).collection("list").doc();
        doucumentRef.set({
          workspaceId: workspaceid,
          Listname: listName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 使用 serverTimestamp
        })
          .then(() => {
            setIsLoading(false);
            console.log("成功");
            // 添加完列表后，重置状态
            setIsAddingList(false);
            setListName('');
          })
          .catch((error) => {
            setIsLoading(false);
            console.error("错误：", error);
          });
      } else {
        // 有重复的数据，执行适当的操作，例如提示用户
        console.log('已存在具有相同名字的列表。');
      }
    });
  };


  // 新增卡片
  const handleCardNameSubmit = (listIndex, ListId) => {
    setIsLoading(true);

    const documentRef = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(ListId)
      .collection("card").doc();

    documentRef.set({
      ListId: ListId,
      canbanid: canbanid,
      canbanname: canbanname,
      Cardname: cardName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 使用 serverTimestamp
      describe: " ",
      deadline: " ",
      member: [],
      state: "未完成",
    })
      .then(() => {
        //重製狀態
        setIsLoading(false);
        console.log("卡片添加成功");
        setIsAddingList(false);
        setcardName('');
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("错误：", error);
      });
  };

  //抓取列表
  React.useEffect(() => {
    // console.log('workspaceid:', workspaceid);
    // console.log('canbanid:', canbanid);

    if (workspaceid && canbanid) { // 检查是否都有有效值
      const listquery = firebase
        .firestore()
        .collection('workspace')
        .doc(workspaceid)
        .collection('canban')
        .doc(canbanid)
        .collection('list');

      const unsubscribe = listquery.onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map((docSnapshot) => {
          const id = docSnapshot.id;
          return { ...docSnapshot.data(), id };
        });
        setlistdata(data);
        //console.log("列表資料", data);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [workspaceid, canbanid]);

  //抓取卡片
  useEffect(() => {
    // console.log('workspaceid:', workspaceid);
    // console.log('canbanid:', canbanid);

    if (workspaceid && canbanid) {
      // 获取列表
      const listquery = firebase
        .firestore()
        .collection('workspace')
        .doc(workspaceid)
        .collection('canban')
        .doc(canbanid)
        .collection('list');

      const unsubscribeList = listquery.onSnapshot((listSnapshot) => {
        const promises = listSnapshot.docs.map((docSnapshot) => {
          const listdocid = docSnapshot.id;
          //console.log('抓取到列表iddd:',listdocid);
          const subcollectionQuery = firebase
            .firestore()
            .collection('workspace')
            .doc(workspaceid)
            .collection('canban')
            .doc(canbanid)
            .collection('list')
            .doc(listdocid)
            .collection('card');

          subcollectionQuery.onSnapshot((subcollectionSnapshot) => {
            const subcollectionData = subcollectionSnapshot.docs.map((subDocSnapshot) => {
              const subDocId = subDocSnapshot.id;
              const subDocData = subDocSnapshot.data();
              //console.log('抓取到到的卡片id:',subDocId);
              return { id: subDocId, ...subDocData };
            });
            //console.log('抓取到到的卡片資料:',subcollectionData);
            // 在这里，检查新数据是否已经存在于 carddata 中
            setcarddata((prevData) => {
              // Filter out existing data to prevent duplicates
              const newData = subcollectionData.filter(
                (item) => !prevData.some((existingItem) => existingItem.id === item.id)
              );

              return [...prevData, ...newData];
            });
            //console.log("卡片資料",carddata);
          });
        });
      });
      // 组件卸载时，调用unsubscribeList以取消所有监听
      return () => {
        unsubscribeList();
      };
    }
  }, []);

  //抓取卡片資料
  React.useEffect(() => {
    setTemporaryCardData(carddata);
    // 在這裡處理你希望在 canbandata 變化時執行的操作
  }, [carddata]);

  //抓取人員
  React.useEffect(() => {
    // 監聽所有工作區的更改
    const workspacesQuery = firebase.firestore().collection('workspace').doc(workspaceid).collection('member');

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
    };
  }, [workspaceid]);

  //佔位符顯示
  const Placeholder = () => {
    return (
      <div className="placeholder">
        {/* 可以放置一些靜態內容或保持空白 */}
      </div>
    );
  };

  useEffect(() => {
    //console.log("DragStartIndex 更新為:", dragStartIndex);
  }, [dragStartIndex]);

  //點擊卡片畫面
  const handleCardClick = (cardId) => {
    if (isDragging === false) {
      console.log("点击卡片");
      setOpenCard(true);
    }
  };

  const handleMouseDown = () => {
    setMouseDownTime(Date.now());
  };

  const handleMouseUp = (cardId, listId) => {
    if (Date.now() - mouseDownTime < 200) { // 200 毫秒内释放认为是点击
      console.log("点击卡片", cardId);
      setSelectedCardId(cardId);
      setSelectedListId(listId);
      setOpenCard(true);
    }
  };

  // 處理拖曳開始的事件
  function handleDragStart(event) {
    setIsDragging(true);
    const { active } = event;

    const parts = active.id.split('-'); // ['card', '123456', 'list', '654321']
    const activeCardId = parts[1]; // 这是卡片ID '123456'
    const activeListId = parts[3]; // 这是列表ID '654321'
    const activeIndex = carddata.findIndex(card => card.id === activeCardId);
    console.log("拖曳開始", activeIndex);

    setDragStartIndex(activeIndex);
    setDraggingCard({ cardId: activeCardId, targetListId: activeListId });
    //console.log("DragStartIndex:", dragStartIndex);
  }

  // useEffect(() => {
  //   console.log("拖曳數值:",isDragging);
  // }, [isDragging]);
  function handleDragMove(event) {
    const { active, over } = event;
    if (!over) return;

    // 获取卡片 ID 和 列表 ID
    const activeParts = active.id.split('-');
    const overParts = over.id.split('-');
    const activeCardId = activeParts[1];
    const activeListId = activeParts[3];

    const overCardId = overParts[1];
    const overListId = overParts[3];

    let overIndex;
    const activeIndex = dragStartIndex;

    if (draggingCard) {
      setDraggingCard(prev => ({ ...prev, targetListId: overListId }));
    }

    // useEffect(() => {
    //   if (activeListId !== overListId) {
    //     // 處理跨列表的邏輯
    //     // overIndex = temporaryCardData.findIndex(card => card.id === overCardId);
    //     // console.log("跨列表overIndex:", overIndex);
    //   } else {
    //     // 處理同列表的邏輯
    //     overIndex = temporaryCardData.findIndex(card => card.id === overCardId);
    //     console.log("拖曳中", overIndex);

    //     // 只有在 activeIndex 不等於 overIndex 時才進行陣列交換
    //     if (activeIndex !== overIndex) {
    //       setTemporaryCardData(prev => arrayMove(prev, activeIndex, overIndex));
    //     }
    //   }
    // }, [temporaryCardData, activeIndex, overIndex, activeListId, overListId, overCardId]);
  }


  // 拖曳結束處理
  function handleDragEnd(event) {
    const { active, over } = event;
    setIsDragging(false);
    console.log("拖曳結束");
    if (!over) return;

    const activeId = active.id.split('-')[1];
    const overId = over.id.split('-')[1];
    const activeIndex = carddata.findIndex(card => card.id === activeId);
    const overIndex = carddata.findIndex(card => card.id === overId);
    setDraggingCard(null); // 清空拖拽状态
    // if (activeIndex !== overIndex) {
    //   setcarddata(arrayMove(carddata, activeIndex, overIndex));
    // }
    setDragStartIndex(null);
    setIsDragging(false);


    //更新拖曳後卡片的列表id
    //   function updateCardListId(activecardId,activeListId,overListId) {
    //     const cardRef = firebase.firestore()
    //       .collection('workspace')
    //       .doc(workspaceid)
    //       .collection('canban')
    //       .doc(canbanid)
    //       .collection('list')
    //       .doc(activeListId) // 使用新的listId
    //       .collection('card')
    //       .doc(activecardId);  // 使用卡片的cardId

    //     // 更新數據
    //     return cardRef.update({
    //         ListId: overListId
    //     })
    //     .then(() => {
    //         console.log("Document successfully updated!");
    //     })
    //     .catch((error) => {
    //         console.error("Error updating document: ", error);
    //     });
    // }



    // //智能合約交易上鍊
    // const uploadCardsToBlockchain = async () => {
    //   try {

    //     for (const card of carddata) {
    //       // 手动编码调用数据
    //   encodeFunctionData('addCard', [card.Cardname, card.ListId, card.id,card.deadline,[firebase.auth().currentUser.uid]]);      const data = cardStorageContract.interface.
    //       console.log("卡片名字:",card.Cardname);
    //       console.log("卡片片列表ID:",card.ListId);
    //       console.log("卡片ID:",card.id);
    //       console.log("截止時間:",selectedDate);
    //       // 创建并发送交易
    //       const tx = await signer.sendTransaction({
    //         to: contractAddress,
    //         data: data
    //       });

    //       // 等待交易被挖掘
    //       const receipt = await tx.wait();
    //       const returndata = receipt.transactionHash;
    //       // 现在可以安全地访问 receipt 对象的属性
    //       console.log("receipt回傳值:", receipt.confirmations);
    //       console.log("完整訊息", receipt);
    //       console.log("Transaction hash:", receipt.transactionHash);
    //       console.log("Block number:", receipt.blockNumber);
    //       console.log("Gas used:", receipt.gasUsed.toString());
    //       console.log(`Card with ID ${card.id} added to the blockchain.`);
    //       // // 使用Interface实例解码交易输入数据
    //       // const parsedTransaction = contractInterface.parseTransaction({  });
    //       // console.log("上鏈回傳的資料",parsedTransaction); // 输出解码后的交易数据
    //     }
    //   } catch (error) {
    //     console.error('Error uploading cards to the blockchain:', error);
    //   }
  };

  const overlay = (
    <div>
      <div className={styles.overlay} style={{ display: openCard ? 'block' : 'none' }} onClick={() => setOpenCard(false)} />
      <div className={styles.overlay} style={{ display: openFinishModal ? 'block' : 'none' }} onClick={() => setOpenFinishModal(false)} />
    </div>
  )

  return (
    <Container>
      {overlay}
      <Sidebar.Pusher style={{ top: 0, bottom: -10, height: '85vh', marginLeft: isActive ? '290px' : '10px' }}>
        <CanbanHeader isActive={isActive} canbanname={canbanname} handleIconClick={handleIconClick} />

        <Sidebar
          as={Menu}
          animation='push'
          direction='left'
          icon='labeled'
          inverted
          vertical
          visible={visible}
          width='wide'
        >
          <Segment className={`${styles.verticalSidebar} ${visible ? styles.visible : ''}`}>
            <Menu.Item className={styles.manageritem}>
              <Image className={styles.image} src={blob} onClick={() => handleItemClick('home')} avatar />
              PmManager
            </Menu.Item>
            <hr className={styles.hr} />
            <Menu.Item className={styles.verticalSidebaritem} onClick={() => handleItemClick('dashboard')}>
              <BiColumns className={styles.icon} />
              看板
            </Menu.Item>
            <Menu.Item className={styles.verticalSidebaritem} onClick={() => handleItemClick('members')}>
              <FaUser className={styles.icon} />
              成員
            </Menu.Item>
          </Segment>
        </Sidebar>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
          <SortableContext items={temporaryCardData.map((card) => `card-${card.id}`)}>
            <div className={styles.cardcontainer}>
              {listdata.map((list, listIndex) => (
                <Card key={list.id} className={styles.list}>

                  <Card.Header className={styles.cardheader}>{list.Listname}</Card.Header>
                  <Container className={styles.taskcontainer}>
                    {temporaryCardData
                      .filter((card) => card.ListId === list.id && card.state === "未完成")
                      .map((card, cardIndex) => (
                        <React.Fragment key={card.id}>
                          <Droppable id={`card-${card.id}-list-${list.id}`} direction="vertical">
                            <Draggable id={`card-${card.id}-list-${list.id}`}>
                              <Card
                                onMouseDown={handleMouseDown}
                                onMouseUp={() => handleMouseUp(card.id, list.id)}
                                className={styles.card}
                              >
                                <Card.Content>
                                  {card.Cardname}
                                </Card.Content>
                              </Card>
                            </Draggable>
                          </Droppable>
                        </React.Fragment>
                      ))
                    }
                  </Container>
                  <Card.Content extra className={styles.contentex}>
                    {isAddingCard === listIndex ? (
                      <div>
                        <input
                          type="text"
                          placeholder="輸入卡片名稱"
                          value={cardName}
                          onChange={(e) => setcardName(e.target.value)}
                          className={styles.customInput}
                        />
                        <Button className={styles.confirmbutton} onClick={() => handleCardNameSubmit(listIndex, list.id)}>確認</Button>
                        <Button className={styles.cancelbutton} onClick={() => cancelCardNameSubmit(listIndex)}>取消</Button>
                      </div>
                    ) : (
                      <Button className={styles.addcardbutton} onClick={() => handleAddCard(listIndex)}>
                        <BiPlus className={styles.iicon} />
                        新增卡片
                      </Button>
                    )}
                  </Card.Content>
                </Card>
              ))}

              {/* 可能还需要一个用于添加新列表的区域 */}
              {isAddingList ? (
                <div>
                  <input
                    type="text"
                    placeholder="輸入列表名稱"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className={styles.customInput}
                  />
                  <Button className={styles.confirmbutton} onClick={handleListNameSubmit}>確認</Button>
                  <Button className={styles.cancelbutton} onClick={cancelListNameSubmit}>取消</Button>
                </div>
              ) : (
                <Button className={styles.addlistbutton} onClick={handleAddList}>
                  <BiPlus className={styles.iicon} />
                  新增列表
                </Button>
              )}
              {/* <Button className="addlistButton" onClick={uploadCardsToBlockchain}>执行项目</Button> */}
            </div>
          </SortableContext>
        </DndContext>
      </Sidebar.Pusher>

      {/* 點擊卡片畫面 */}
      <Modal className={styles.cardmodal} onClose={() => setOpenCard(true)} open={openCard} >
        <Modal.Description className={styles.desheader}>
          <Header className={styles.modalHeader}>
            {carddata.find(card => card.id === selectedCardId)?.Cardname || '未選中任何卡片'}
          </Header>

        </Modal.Description>
        <Modal.Description className={styles.deslheader}>
          <Header className={styles.modallheader}>描述</Header>
          {isAddingInModal ? (
            <div className={styles.div}>
              <textarea
                className={styles.textArea}
                placeholder="輸入內容...."
                value={modalInputValue}
                onChange={(e) => setModalInputValue(e.target.value)}
              />
              <Button className={styles.modalbutton} onClick={() => handleDescriptSent(selectedCardId)}>確認</Button>
              <Button className={styles.rmodalbutton} onClick={handleCancelInModal} >取消</Button>
            </div>
          ) : (
            <Button className={styles.textAreabutton} onClick={() => handleCardDescribe(selectedCardId)}>新增更詳細的描述...</Button>
          )}
        </Modal.Description>
        <Modal.Description className={styles.desadd}>
          <Header className={styles.modaladd}>新增至卡片：</Header>
          <div className={styles.drop}>
            <Button className={styles.modalbutton} onClick={() => setDropdownOpen(!isDropdownOpen)}>成員</Button>
            <span>{memberoptions ? memberoptions.text : ''}</span>
            {message && <p className={styles.p}>{message}</p>}
            <ul className={`${styles.dropdown} ${isDropdownOpen ? styles.open : ''}`}>
              {memberoptions.map((option) => (
                <li key={option.key} onClick={() => handleAddcardMembers(option.value)}>
                  {option.text}
                </li>
              ))}
            </ul>
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
          />
          {daymessage && <p className={styles.p}>{daymessage}</p>}
          <Button className={styles.modalbutton} onClick={handleSaveDate}>保存日期</Button>
        </Modal.Description>
        <Button className={styles.upload} onClick={handleFinish}>完成</Button>
      </Modal>

      {/* 完成 Modal */}
      <Modal className={styles.modal} onClose={() => setOpenFinishModal(false)} open={openFinishModal}>
        <Modal.Header className={styles.modalHeader}>確認將卡片送出嗎？</Modal.Header>
        <Modal.Description>
          {/* 完成 Modal 的内容 */}
          <Button className={styles.confirmbutton} onClick={handleSentCard}>確認</Button>
          <Button className={styles.cancelbutton} onClick={cancelCardSent}>再想想</Button>
        </Modal.Description>
      </Modal>
    </Container>
  );
}


export default Canbanpage;
