//import logo from './logo.svg';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, Grid } from 'semantic-ui-react';
import Header from './Header';
import MySettings from './pages/MySettings';
import Home from './pages/Home';
import Frontpage from './pages/Frontpage';
import TestContract from './pages/TestContract';
import Canbanpage from './pages/Canbanpage';
import VerticalSidebar from './VerticalSidebar'; // 导入 VerticalSidebar 组件
import './App.css';

function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleIconClick = () => {
    setSidebarVisible(!sidebarVisible) ;
  };

  return (
    <BrowserRouter>
      <Header handleIconClick={handleIconClick} />
      
      <Sidebar.Pushable>
        <VerticalSidebar
          animation='push'
          direction='left'
          visible={sidebarVisible}
          
        />
        
        <Sidebar.Pusher style={{ top:0, bottom: -10, height: '100vh', }}>

          <Grid columns='equal'>
            <Grid.Column>
              <Routes>
                <Route path="/" element={<Frontpage />} exact />
                <Route path="/home" element={<Home />} exact />
                <Route path="/MySettings" element={<MySettings />} exact />
                <Route path="/TestContract" element={<TestContract />} exact />
                <Route path="/Canbanpage" element={<Canbanpage/>} exact/>
                {/* 其他页面的路由 */}
              </Routes>
            </Grid.Column>
          </Grid>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </BrowserRouter>
  );
}

export default App;
