import React from "react";
import firebase from "../utils/firebase";
import 'firebase/compat/firestore';
import "firebase/auth";
import { List } from "semantic-ui-react";
function Workspace(){
    const [workspace,setworkspace] = React.useState([]);
    //第一次渲染時抓資料
    React.useEffect(() =>{
      firebase
      .firestore()
      .collection('workspace')//指定要抓資料的集合
      .get()
      .then((collectionSnapshot) =>{//獲得集合快照的物件
        const data = collectionSnapshot.docs.map((doc) =>{//獲得文件快照的陣列
            return doc.data();
        });
        // console.log(data);
        setworkspace(data);
      });
    },[]);
    return <List animated selection>
        {workspace.map((workspace,index) =>{
            return <List.Item key={index}>{workspace.name}</List.Item>//在React做map動作時，要傳key進來
        })}
    </List>

}
export default Workspace; 