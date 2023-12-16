//import logo from './logo.svg';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, Grid } from 'semantic-ui-react';
import Header from './Header';
import MySettings from './pages/MySettings';
import Home from './pages/Home';
import Frontpage from './pages/Frontpage';
import Canbanpage from './pages/Canbanpage';
import VerticalSidebar from './VerticalSidebar'; // 导入 VerticalSidebar 组件
import SortableTest from './pages/SortableTest';
import Workspacemember from './pages/Workspacemember';
import CardViewArea from './pages/CardViewArea';
import CardReviewArea from'./pages/CardReviewArea';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Frontpage />} exact />
        <Route path="/home" element={<Home />} exact />
        <Route path="/MySettings" element={<MySettings />} exact />
        <Route path="/Canbanpage" element={<Canbanpage/>} exact/> 
        <Route path="/SortableTest" element={<SortableTest/>} exact/> 
        <Route path="/Workspacemember" element={<Workspacemember/>} exact/> 
        <Route path="/CardViewArea" element={<CardViewArea/>} exact/> 
        <Route path="/CardReviewArea" element={<CardReviewArea/>} exact/> 

      </Routes>   
    </BrowserRouter>
  );
}

export default App;
