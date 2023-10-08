// 整個網頁應用程式地進入點
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'semantic-ui-css/semantic.min.css'
import './index.css';
//import App元件進來
import App from './App';
import reportWebVitals from './reportWebVitals';

// 把App.js裡的元件渲染到index.html的Div裡面 把APP寫成元件的形式，傳入root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
