import React, { useState,useEffect } from 'react';
import { Card, Grid , Sidebar, Button, Segment } from 'semantic-ui-react';
// import { DndContext } from '@dnd-kit/core';
// import { Droppable } from './Droppable';
// import { Draggable } from './Draggable';
import './CardStyles.css';
import CanbanHeader from './CanbanHeader';
import VerticalSidebar from '../VerticalSidebar'; // 导入 VerticalSidebar 组件


function List1() {
  return (
    <Segment className="custom-segment">
     
    <Card.Group >
      <Card>
        <Card.Content>
          <Card.Header>Option1</Card.Header>
        </Card.Content>
      </Card>
        <Card   header='Option 1' />
        <Card   header='Option 2' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />  
     
    </Card.Group>
    <Button>Add Card!</Button>
    </Segment>
  );
}


function List2() {
  return (
    <Segment className="custom-segment">
     
    <Card.Group >
      <Card>
        <Card.Content>
          <Card.Header>Option1</Card.Header>
        </Card.Content>
      </Card>
        <Card   header='Option 1' />
        <Card   header='Option 2' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />
        <Card   header='Option 3' />  
     
    </Card.Group>
    <Button>Add Card!</Button>
    </Segment>
     


  );
}


function List3() {
  return (
    <Card.Group>
      <Card header='新增卡片'/>
    </Card.Group>
  );
}


function List4() {
  return (
    <Card.Group>
      <Card header='新增卡片'/>
    </Card.Group>
  );
}
function List5() {
  return (
    <Card.Group>
      <Card header='新增卡片'/>
    </Card.Group>
  );
}
function List6() {
  return (
    <Card.Group>
      <Card header='新增卡片6'/>
    </Card.Group>
  );
}
function List7() {
  return (
    <Card.Group>
      <Card header='新增卡片7'/>
    </Card.Group>
  );
}
function List8() {
  return (
    <Card.Group>
      <Card header='新增卡片8'/>
    </Card.Group>
  );
}




function Canbanpage(props) {
  const { data } = props;
  const [visible, setVisible] = React.useState(false);




  const handleIconClick = () => {
    setVisible(!visible) ;
  };




  const handleAddList =() =>{
    console.log("clickcanbanid 值是：", data);
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


     <Sidebar.Pusher style={{ top:0, bottom: -10, height: '85vh', }}>


     <div className="card-container">
       
        <List1 />
        <List2 />
        <List3 />
        <Button className='addlistButton' onClick={handleAddList}>新增列表</Button>
     
       


       


        {/* Add more lists as needed */}
      </div>


      </Sidebar.Pusher>
    </Sidebar.Pushable>
  </>
   
  );
}


export default Canbanpage;
