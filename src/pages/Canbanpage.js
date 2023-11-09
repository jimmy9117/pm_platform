import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Grid , Sidebar, Button, Segment } from 'semantic-ui-react';
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
  const [draggingId, setDraggingId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  
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
    
    //取消新增卡片按鈕 
    const cancelCardNameSubmit =() =>{
      setIsAddingCard(null);
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
    
    //新增卡片
    const handleCardNameSubmit = (listIndex,ListId) => {
      // console.log('clickcanbanid 值是：', canbanid);
      // console.log('clickworkspaceid 值是：', workspaceid);
      // console.log("listid:",ListId);
      // 查询是否有具有相同名字的列表
      const cardQuery = firebase
        .firestore()
        .collection('workspace')
        .doc(workspaceid)
        .collection('canban')
        .doc(canbanid)
        .collection('list')
        .doc(ListId)
        .collection('card')
        .where('cardName','==',cardName);
    
      cardQuery.get().then((querySnapshot) => {
        if (querySnapshot.empty) {
          // 没有重复的数据，可以添加
          // console.log('clickcanbanid 值是：', canbanid);
          // console.log('clickworkspaceid 值是：', workspaceid);
          // console.log('listindex 值是：', ListId);
          setIsLoading(true);
    
          const doucumentRef = firebase.firestore().collection("workspace").doc(workspaceid).collection("canban").doc(canbanid).collection("list").doc(ListId).collection("card").doc();
          doucumentRef.set({
            ListId: ListId,
            Cardname: cardName,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 使用 serverTimestamp
          })
            .then(() => {
              setIsLoading(false);
              console.log("成功");
              // 添加完列表后，重置状态
              setIsAddingList(false);
              setcardName('');
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
    
  // 處理拖曳開始的事件
  function handleDragStart(event) {
    console.log("handleDragStart 被調用");
    const { active } = event;
    setDraggingId(active.id);
    console.log("拖曳時的數值1:", active.id);
  }

  useEffect(() => {
    console.log("拖曳時的數值:", draggingId);
  }, [draggingId]);
  

    // 拖曳結束處理
    function handleDragEnd(event) {
      const { active, over } = event;
    
      // 這裡假設 active 和 over 都是形如 `card-${card.id}-list-${list.id}` 的 ID
      if (over && active.id !== over.id) { // 確保有一個過渡區域並且不是在同一位置放下
        // 分離 ID 來獲得卡片 ID 和列表 ID
        const activeIds = active.id.split('-');
        const overIds = over.id.split('-');
        const activeCardId = activeIds[1];
        const overCardId = overIds[1];
        const activeListId = activeIds[3];
        const overListId = overIds[3];
    
        // 確認卡片是否在同一列表中移動
        if (activeListId === overListId) {
          // 在列表中尋找拖曳的卡片和目標卡片的索引
          const activeIndex = carddata.findIndex(card => card.id.toString() === activeCardId);
          const overIndex = carddata.findIndex(card => card.id.toString() === overCardId);
    
          if (activeIndex !== -1 && overIndex !== -1) {
            setcarddata((cards) => {
              // 創建卡片的副本
              const newCards = [...cards];
              // 移除並保存拖曳的卡片
              const [removed] = newCards.splice(activeIndex, 1);
              // 將拖曳的卡片插入到目標位置
              newCards.splice(overIndex, 0, removed);
    
              // 返回新的卡片數組以更新狀態
              return newCards;
            });
          }
        }
      }
    
      // 無論是否重新排序，都應該重置拖曳狀態
      setDraggingId(null);
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

return (
  <>
    
    <CanbanHeader handleIconClick={handleIconClick} />
    <Sidebar.Pushable>
      <VerticalSidebar
        animation='push'
        direction='left'
        visible={visible}
      />
      <Sidebar.Pusher style={{ top:0, bottom: -10, height: '85vh' }}>

<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>        
          <div className="card-container">
            {listdata.map((list, listIndex) => (
              <Droppable key={list.id} id={`list-${list.id}`}>
                <Card>
                  <Card.Content>
                    <Card.Header>{list.Listname}</Card.Header>
                    <SortableContext  items={carddata.filter((card) => card.ListId === list.id).map((card) => `card-${card.id}`)}>
                    {
                      carddata
                        .filter((card) => card.ListId === list.id)
                        .map((card, cardIndex) => (
                          <React.Fragment key={card.id}>
                            {draggingId === `card-${card.id}-list-${list.id}` ? (
                              <Placeholder />
                            ) : (
                              <Draggable id={`card-${card.id}-list-${list.id}`} onDragStart={handleDragStart}>
                                <Card>
                                  <Card.Content>{card.Cardname}</Card.Content>
                                </Card>
                              </Draggable>
                            )}
                          </React.Fragment>
                        ))
                    }

                    </SortableContext>
                  </Card.Content>

                  <Card.Content extra>
                    {isAddingCard === listIndex ? (
                      <div>
                        <input
                          type="text"
                          placeholder="輸入卡片名稱"
                          value={cardName}
                          onChange={(e) => setcardName(e.target.value)}
                        />
                        <button onClick={() => handleCardNameSubmit(listIndex, list.id)}>確認</button>
                        <button onClick={() => cancelCardNameSubmit(listIndex)}>取消</button>
                      </div>
                    ) : (
                      <Button onClick={() => handleAddCard(listIndex)}>新增卡片</Button>
                    )}
                  </Card.Content>
                </Card>
              </Droppable>
            ))}

            {/* 可能还需要一个用于添加新列表的区域 */}
            {isAddingList ? (
              <div>
                <input
                  type="text"
                  placeholder="輸入列表名稱"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
                <button onClick={handleListNameSubmit}>確認</button>
                <button onClick={cancelListNameSubmit}>取消</button>
              </div>
            ) : (
              <Button className="addlistButton" onClick={handleAddList}>
                執行專案
              </Button>
            )}
          </div>
        </DndContext>

      </Sidebar.Pusher>
    </Sidebar.Pushable>
  </>
);
}


export default Canbanpage;
