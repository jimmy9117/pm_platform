//import logo from './logo.svg';
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Header';
import MySettings from './pages/MySettings';
import Home from './pages/Home';
import Frontpage from './pages/Frontpage';
import Canbanpage from './pages/Canbanpage';
import SortableTest from './pages/SortableTest';
import Dashboard from './pages/Dashboard';
import OtherComponent from './pages/OtherComponent';
import Workspacemember from './pages/Workspacemember';
import CardViewArea from './pages/CardViewArea';
import CardReviewArea from './pages/CardReviewArea';
import Settings from './pages/Settings';
import './App.css';

function App() {

  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Frontpage />} exact />
        <Route path="/home" element={<Home />} exact />
        <Route path="/MySettings" element={<MySettings />} exact />
        <Route path="/Canbanpage" element={<Canbanpage />} exact />
        <Route path="/SortableTest" element={<SortableTest />} exact />
        <Route path="/Dashboard" element={<Dashboard />} exact />
        <Route path="/Other" element={<OtherComponent />} exact />
        <Route path="/Workspacemember" element={<Workspacemember/>} exact/> 
        <Route path="/CardViewArea" element={<CardViewArea/>} exact/> 
        <Route path="/CardReviewArea" element={<CardReviewArea/>} exact/> 
        <Route path="/Settings" element={<Settings/>} exact/> 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
