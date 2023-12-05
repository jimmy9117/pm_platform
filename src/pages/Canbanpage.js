import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Grid , Sidebar, Button, Segment, Modal, Header, Form, Icon } from 'semantic-ui-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Droppable } from './Droppable';
import { Draggable } from './Draggable';
import './CardStyles.css';
import CanbanHeader from './CanbanHeader';
import VerticalSidebar from '../VerticalSidebar'; // 导入 VerticalSidebar 组件
import firebase from "../utils/firebase";
import "firebase/auth";

//Ethers.js
import contractABI from '../contracts/CardStorage.json';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { Interface, Log } from "ethers";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Canbanpage() {
  const location = useLocation();
  const { data } = location.state || {}; // 確保 data 存在
  const [visible, setVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(null);
  const [listName, setListName] = useState(''); // 用于存储输入的列表名称
  const [cardName, setcardName] = useState('');
  const [workspaceid,setworkspaceid] = useState("");
  const [canbanid,setcanbanid] = useState("");
  const [listdata,setlistdata] = React.useState([]);
  const [carddata,setcarddata] = React.useState([]);
  const [temporaryCardData, setTemporaryCardData] = useState([...carddata]);
  const [draggingCard, setDraggingCard] = useState(null);
  const [draggingOverListId, setDraggingOverListId] = useState(null);
  const [dragStartIndex,setDragStartIndex] = useState(null);
  //點擊卡片判斷
  const [openCard,setOpenCard] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCardInfId, setSelectedCardInfId] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);

  //卡片Modal判斷
  const [isAddingInModal, setIsAddingInModal] = useState(false);
  const [modalInputValue, setModalInputValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  
  // 初始化 ethers.js 和智能合约
  const contractAddress = '0xA25f130124E208833F8c74DD46E82Bc8479D0018';
  const provider = new Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const cardStorageContract = new Contract(contractAddress, contractABI, signer);
  const contractInterface = new Interface(contractABI);

  //dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  //側邊攔
  const handleIconClick = () => {
    setVisible(!visible) ;
  };

  // 检查 data 是否存在
  if (data && !workspaceid && !canbanid) {
    const clickcanbanid = data.clickcanbanid;
    const clickworkspaceid = data.clickworkspaceid;
  
    setworkspaceid(clickworkspaceid);
    setcanbanid(clickcanbanid);

  }
  

    //新增列表按鈕
    const handleAddList =() =>{
      setIsAddingList(true);
    };

  // 新增卡片按鈕
  const handleAddCard = (listIndex) => {
    console.log(listIndex,"test");
  
    if (isAddingCard === listIndex) {
      // 如果点击的是已经展开的列表，则关闭它
      setIsAddingCard(null);
    } else {
      // 否则，展开点击的列表
      setIsAddingCard(listIndex);
    }
  };

    //取消新增列表按鈕 
    const cancelListNameSubmit =() =>{
      setIsAddingList(false);
    };
    
    //點擊Modal描述
    const handleCardDescribe = (CardId)=>{
      setIsAddingInModal(true);
    };

    //確認ModalDescribe送出
  const handleDescriptSent = (CardId) =>{
    console.log("點擊卡片",CardId);

    const cardQuery = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(CardId)
      .collection("cardinf").get()
      .then((collectionSnapshot) => {
      if (!collectionSnapshot.empty) {
      const cardInfId = collectionSnapshot.docs[0].id; // 获取第一个文档的 ID
      // 使用获取到的文档 ID 更新卡片信息
      const cardInfRef = firebase.firestore()
        .collection("workspace").doc(workspaceid)
        .collection("canban").doc(canbanid)
        .collection("list").doc(selectedListId)
        .collection("card").doc(CardId)
        .collection("cardinf").doc(cardInfId);

      cardInfRef.update({
        describe: modalInputValue
      })
      .then(() => {
        console.log("卡片描述信息已更新");
        setIsAddingInModal(false);

      })
      .catch(error => {
        console.error("更新卡片描述信息时出错:", error);
      });
    } else {
      console.log("未找到卡片信息文档");
    }
  })
    .catch(error => {
      console.error("查询卡片信息时出错:", error);
    });

    }
    //取消Modal描述
    const handleCancelInModal = ()=>{
      setIsAddingInModal(false);
    };

    //取消新增卡片按鈕 
    const cancelCardNameSubmit =() =>{
      setIsAddingCard(null);
    };

    //保存日期
    const handleSaveDate = () =>{
      console.log("");
      if (!selectedDate) {
        alert("请先选择一个日期。");
        return;
      }
      const cardQuery = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(selectedCardId)
      .collection("cardinf").get()
      .then((collectionSnapshot) => {
      if (!collectionSnapshot.empty) {
      const cardInfId = collectionSnapshot.docs[0].id; 

      const cardInfRef = firebase.firestore()
      .collection("workspace").doc(workspaceid)
      .collection("canban").doc(canbanid)
      .collection("list").doc(selectedListId)
      .collection("card").doc(selectedCardId)
      .collection("cardinf").doc(cardInfId);

       cardInfRef.update({
        deadline: selectedDate
      })
      .then(() => {
        console.log("卡片終止日期已更新");
       
      })
      .catch(error => {
        console.error("更新卡片時間出错:", error);
      });
    } else {
      console.log("未找到卡片信息文档");
    }
  })
    .catch(error => {
      console.error("查询卡片信息时出错:", error);
    });
}

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
        Cardname: cardName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 使用 serverTimestamp
      })
      .then(() => {
        const cardInfRef = firebase.firestore()
        .collection("workspace").doc(workspaceid)
        .collection("canban").doc(canbanid)
        .collection("list").doc(ListId)
        .collection("card").doc(documentRef.id)
        .collection("cardinf").doc();

        cardInfRef.set({
          cardId:documentRef.id,
          describe:" ",
          deadline:" ",
        }).then(() =>{
          console.log("以新增卡片資訊");
        })
        .catch(error =>{
          console.error("添加卡片資訊錯誤",error);
        });
        
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
            return {...docSnapshot.data(),id};
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
    React.useEffect(() => {
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
    },[]);

    React.useEffect(() => {
      console.log("carddata 狀態變化:", carddata);
      setTemporaryCardData(carddata);
      // 在這裡處理你希望在 canbandata 變化時執行的操作
    }, [carddata]);
    
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
    
    //點擊卡片畫密
    const handleCardClick = (cardId) => {
     if (isDragging === false) {
    console.log("点击卡片");
    setOpenCard(true);
  }
    };

    const handleMouseDown = () => {
      setMouseDownTime(Date.now());
    };
    
    const handleMouseUp = (cardId,listId) => {
      if (Date.now() - mouseDownTime < 200) { // 200 毫秒内释放认为是点击
        console.log("点击卡片",cardId);
        setSelectedCardId(cardId);
        setSelectedListId(listId);
        setOpenCard(true);
      }
    };

  // 處理拖曳開始的事件
  function handleDragStart(event) {
    setIsDragging(true);
    const { active } = event;
    console.log("拖曳開始");
    const parts = active.id.split('-'); // ['card', '123456', 'list', '654321']
    const activeCardId = parts[1]; // 这是卡片ID '123456'
    const activeListId = parts[3]; // 这是列表ID '654321'
    const activeIndex = carddata.findIndex(card => card.id === activeCardId);
    setDragStartIndex(activeIndex); 
    setDraggingCard({ cardId: activeCardId, targetListId: activeListId });
    //console.log("DragStartIndex:", dragStartIndex);
  }

  useEffect(() => {
    console.log("拖曳數值:",isDragging);
  }, [isDragging]);
  
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
  // console.log(" activeCardId:", activeCardId); 
  //  console.log(" activeListId:", activeListId);
  // console.log(" overCardId:", overCardId);
  // console.log(" overListId:", overListId);
  
  let overIndex;
  const activeIndex = dragStartIndex; 

  if (draggingCard) {
    setDraggingCard(prev => ({ ...prev, targetListId: overListId }));
  }
  
  

  if ( activeListId !== overListId) {
    overIndex = temporaryCardData.findIndex(card => card.id === overCardId);
    console.log("跨列表overIndex:", overIndex);

  } else {
    // 如果是在相同列表中移动，找到overCardId的索引
    overIndex = temporaryCardData.findIndex(card => card.id === overCardId);
    console.log("同列表overIndex:", overIndex);
    setTemporaryCardData(prev => {
      return arrayMove(prev, activeIndex, overIndex);
    });
  }
// if (activeIndex !== overIndex) {
//       setTemporaryCardData(prev => {
//         const updated = [...prev];
//         const [removed] = updated.splice(activeIndex, 1);
//         updated.splice(overIndex, 0, removed);
//         return updated;
//       });
//     }
  
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

    }
    
    
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



//智能合約交易上鍊
const uploadCardsToBlockchain = async () => {
  try {

    for (const card of carddata) {
      // 手动编码调用数据
      const data = cardStorageContract.interface.encodeFunctionData('addCard', [card.Cardname, card.ListId, card.id]);
      console.log("卡片名字:",card.Cardname);
      console.log("卡片片列表ID:",card.ListId);
      console.log("卡片ID:",card.id);
      console.log("截止時間:",selectedDate);
      // 创建并发送交易
      const tx = await signer.sendTransaction({
        to: contractAddress,
        data: data
      });

      // 等待交易被挖掘
      const receipt = await tx.wait();
      const returndata = receipt.transactionHash;
      // 现在可以安全地访问 receipt 对象的属性
      console.log("receipt回傳值:", receipt.confirmations);
      console.log("完整訊息", receipt);
      console.log("Transaction hash:", receipt.transactionHash);
      console.log("Block number:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
      console.log(`Card with ID ${card.id} added to the blockchain.`);
      // // 使用Interface实例解码交易输入数据
      // const parsedTransaction = contractInterface.parseTransaction({  });
      // console.log("上鏈回傳的資料",parsedTransaction); // 输出解码后的交易数据
    }
  } catch (error) {
    console.error('Error uploading cards to the blockchain:', error);
  }
};

return (
  <>
    <CanbanHeader handleIconClick={handleIconClick} />
    <Sidebar.Pushable>
      <VerticalSidebar
        animation='push'
        direction='left'
        visible={visible}
      />
      <Sidebar.Pusher style={{ top: 0, bottom: -10, height: '85vh' }}>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>        
          <SortableContext items={temporaryCardData.map((card) => `card-${card.id}`)}>
            <div className="card-container">
            {listdata.map((list, listIndex) => (
              <Card key={list.id}>
                <Card.Content>
                  <Card.Header>{list.Listname}</Card.Header>
                  {temporaryCardData
                    .filter((card) =>  card.ListId === list.id )
                    .map((card, cardIndex) => (
                      <React.Fragment key={card.id}>
                          <Droppable id={`card-${card.id}-list-${list.id}`}>
                            <Draggable id={`card-${card.id}-list-${list.id}`}>
                            <Card  onMouseDown={handleMouseDown} onMouseUp={() => handleMouseUp(card.id,list.id)}>
                              <Card.Content>
                                {card.Cardname}
                               
                              </Card.Content>
                            </Card>
                          </Draggable>
                        </Droppable>
                      </React.Fragment>
                      ))
                    }
 
                    <Card.Content extra>
                      {isAddingCard === listIndex ? (
                        <div>
                          <input
                            type="text"
                            placeholder="输入卡片名称"
                            value={cardName}
                            onChange={(e) => setcardName(e.target.value)}
                          />
                          <button onClick={() => handleCardNameSubmit(listIndex, list.id)}>确认</button>
                          <button onClick={() => cancelCardNameSubmit(listIndex)}>取消</button>
                        </div>
                      ) : (
                        <Button onClick={() => handleAddCard(listIndex)}>新增卡片</Button>
                      )}
                    </Card.Content>
                  </Card.Content>
                </Card>
              ))}

              {/* 可能还需要一个用于添加新列表的区域 */}
              {isAddingList ? (
                <div>
                  <input
                    type="text"
                    placeholder="输入列表名称"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                  />
                  <button onClick={handleListNameSubmit}>确认</button>
                  <button onClick={cancelListNameSubmit}>取消</button>
                </div>
              ) : (
                <Button className="addlistButton" onClick={handleAddList}>
                  新增列表
                </Button>
              )}
              <Button className="addlistButton" onClick={uploadCardsToBlockchain}>执行项目</Button>
            </div>
          </SortableContext>

          
        </DndContext>

      </Sidebar.Pusher>
    </Sidebar.Pushable>

     {/* 點擊卡片畫面 */}
     <Modal onClose={() => setOpenCard(false)} open={openCard}>
        <Modal.Header></Modal.Header>
          <Modal.Description>
            <Header>
            {carddata.find(card => card.id === selectedCardId)?.Cardname || '未选中任何卡片'}
            </Header>
            <Header>描述</Header>
    
          </Modal.Description>
          <Modal.Description>
            {isAddingInModal ? (
              <div>
                <input
                  type="text"
                  placeholder="输入内容"
                  value={modalInputValue}
                  onChange={(e) => setModalInputValue(e.target.value)}
                />
                <button onClick={()=>handleDescriptSent(selectedCardId)}>确认</button>
                <button onClick={handleCancelInModal} >取消</button>
              </div>
            ) : (
              <Button onClick={() => handleCardDescribe(selectedCardId)}>新增内容</Button>
            )}
        </Modal.Description>
        <Modal.Description>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
          />
          </Modal.Description>
          <Modal.Description>
           <Button onClick={handleSaveDate}>保存日期</Button>
          </Modal.Description>
      </Modal>
      


  </>
  
);
  
}


export default Canbanpage;
