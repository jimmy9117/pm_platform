import React from "react";
import { Menu, Popup,Search,Button,Sidebar } from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase from "./utils/firebase";
import { useNavigate } from "react-router-dom";
import Web3 from 'web3';
import "firebase/auth";


function Header() {
  const [user, setUser] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");
  const [isLoadings, setIsLoadings] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const navigate = useNavigate();
  const db = firebase.firestore();

  // React.useEffect(() => {
  //   firebase.auth().onAuthStateChanged((currentUser) => {
  //     setUser(currentUser);
  //   });
  // }, []);

 
  //連結錢包判斷
  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoadings(true);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const walletAddress = accounts[0]; // 取得錢包地址
        console.log(walletAddress);
        console.log("Before");
        console.log("Fetching data from:", '/customTokenEndpoint');
        const response = await fetch('https://us-central1-pm-manager-a5c34.cloudfunctions.net/customTokenEndpoint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ walletAddress }) // 將錢包地址作為請求的內容傳送
        });
        console.log("After");
        if (response.ok) {
          const customToken = await response.text();
          // 使用 customToken 進行後續操作
          console.log("回傳後端生成錢包令牌:",customToken);
          // 在前端使用自定義令牌登入 Firebase
          try {
            await firebase.auth().signInWithCustomToken(customToken);
            console.log('用戶登入成功');
          } catch (error) {
            console.log('用戶登入失敗:', error);
          }
          setIsLoadings(false);
          setUser(walletAddress);
          setWalletAddress(walletAddress);
          await createUserdata();
          navigate("/home");
        } else {
          setUser("");
          console.log('Error:', response.status);
        }
      } catch (error) {
        setUser(""); 
        console.log(error);
      }
    }
  };
  

  
  //位首次使用用戶新增資料
  async function createUserdata() {
    if (user) {
      // 用戶已登入，可以執行相關操作
      console.log("用戶已登入");
      // 在這裡可以根據需要進行其他操作
    } else {
      // 用戶尚未登入，處理第一次登入的情況
      console.log("用戶尚未登入");
      // 檢查是否已有以錢包地址作為 UID 的用戶資料
      const  doucumentRef = await db.collection('userdata').where('author.uid', '==', walletAddress).get();
  
      if (doucumentRef.empty) {
        // 如果找不到對應的用戶資料，表示是第一次登入，則以錢包地址作為 UID 創建新用戶資料
        console.log("第一次登入，創建新用戶資料");
        const newUserRef = db.collection('userdata').doc();
        const userData = {
          name: "",
          email: "",
          createdAt: firebase.firestore.Timestamp.now(),
          author: { 
            displayname: "",
            uid: walletAddress,
            email: "",
            
          },
        };
        await newUserRef.set(userData);
      } else {
        // 找到對應的用戶資料，表示用戶已經登入過，直接使用該用戶的 UID 進行後續操作
        console.log("用戶已登入過，直接使用該用戶的 UID");
        const user = doucumentRef.docs[0].data();
        console.log("User UID:", user.uid);
      }
    }
  }
  
  const disconnect = async () => {
    try {
      await firebase.auth().signOut();
      setUser('');
      navigate("/");
    } catch(error) {
      console.log("登出失敗:",error);
    }
    
  };

  return ( 
    <Menu>
      <Menu.Menu position="left">
        {user ? (
          <>
            <Menu.Item as={Link} to="/home">
             pm_manager
            </Menu.Item>
            <Menu.Item as={Link} to="/SortableTest">拖曳測試</Menu.Item>
            <Menu.Item as={Link} to="/TestContract">智能合約範例</Menu.Item>
            <Menu.Item as={Link} >
              <Popup
                content={
                  <Menu vertical>
                    <Menu.Item>建立看板</Menu.Item>
                    <Menu.Item>建立工作區</Menu.Item>
                  </Menu>
                }
                on="click"
                pinned
                position="bottom left"
                trigger={<span><Button>建立</Button></span>}
              />
            </Menu.Item>
            
          </>
        ) : (
          <>
            <Menu.Item as={Link} to="/">
             pm_manager
            </Menu.Item>
            <Menu.Item>特徵</Menu.Item>
            <Menu.Item>計畫</Menu.Item>
          </>
        )}
      </Menu.Menu>
      <Menu.Menu position="right">
        {user ? (
          <>
            <Menu.Item>
              <Search />
            </Menu.Item>
            <Menu.Item as={Link} to="/MySettings">
              人員
            </Menu.Item>

            <Menu.Item >
              <Popup
                content={
                  <Menu vertical>
                     <Menu.Item onClick={disconnect}>中断钱包连接</Menu.Item>
                  </Menu>
                }
                on="click"
                pinned
                position="bottom left"
                trigger={
                  <span
                  style={{
                    maxWidth: '100px',
                    paddingRight: '10px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user}
                  </span>
                }
              />
            </Menu.Item>

            {/* <Menu.Item onClick={() => firebase.auth().signOut()}>
              登出
            </Menu.Item> */}
          </>
        ) : (
          <Button onClick={connect} loading={isLoadings} style={{ fontWeight: 'bold' }}>
            Connect Wallet
          </Button>
        )}

      </Menu.Menu> 
    </Menu>
  );
}

export default Header;
