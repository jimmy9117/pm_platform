import { Header , Button , Segment , Modal , Input} from "semantic-ui-react";
import React from "react";
import firebase from "../utils/firebase";



function Myname() {
  const user = firebase.auth().currentUser || {};
  const [isModalOpen,setIsModalOpen] = React.useState(false);
  const [displayName,setDisplayName] = React.useState("");
  const [isLoading,setIsloading] = React.useState(false); 

  function onsubmit(){
    setIsloading(true);
    setIsModalOpen(true);
    user.updateProfile({
      displayName:displayName,
    })
    .then(() =>{ 
      setIsloading(false);
      setDisplayName("");
      setIsModalOpen(false);
     
    });
  }

  return(
    <>
      <Header size="small">
        會員名稱
        <Button floated="right" onClick={()=>setIsModalOpen(true)}>
          修改
        </Button>
      </Header>
      <Segment vertical>{user.displayName}</Segment>
      <Modal open={isModalOpen} size="mini">
        <Modal.Header>修改會員名稱</Modal.Header>
        <Modal.Content>
          <Input placeholder = "輸入新的會員名稱" 
          value ={displayName} 
          onChange={(e) => setDisplayName(e.target.value)}
          fluid
        />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={()=>setIsModalOpen(false)}>取消</Button>
          <Button onClick={onsubmit} loading={isLoading}>修改</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
    
  
  
}
function MySettings(){
  const user = firebase.auth().currentUser || {};
  return (
    <>
      <Header>會員資料</Header>
      <Myname />
      <Header>會員信箱</Header>
      <Header size="small">
        會員信箱
        <Button floated="right">修改</Button>
      </Header>
      <Segment vertical>{user.email}</Segment>
    </>
  );
}

export default MySettings;