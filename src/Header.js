import React from "react";
import { Menu, Popup, Button, Segment, Modal, Image } from "semantic-ui-react";
import { Link, useNavigate } from "react-router-dom";
import firebase from "./utils/firebase";
// 從 ethers 的 providers 子模塊中導入 Web3Provider
import { Web3Provider } from '@ethersproject/providers';
import "firebase/auth";
import { FaArrowRight } from "react-icons/fa";
import { BsChevronDown } from 'react-icons/bs';
import { FiSearch } from 'react-icons/fi';
import { ImSpinner } from "react-icons/im";
import styles from "./Header.module.css";
import Meta from "./image/Metamask.jpg";


function Header() {
  const [user, setUser] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");
  const [isLoadings, setIsLoadings] = React.useState(false);
  const [showWalletModal, setShowWalletModal] = React.useState(false);//錢包modal
  const navigate = useNavigate();
  const db = firebase.firestore();

  const handleButtonClick = () => {
    setShowWalletModal(true)
  };

  //連結錢包判斷
  const connect = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoadings(true);
        // 使用導入的 Web3Provider
        const provider = new Web3Provider(window.ethereum);
        provider.getNetwork().then(network => console.log(network));
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const walletAddress = await signer.getAddress();
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
          console.log("回傳後端生成錢包令牌:", customToken);
          // 在前端使用自定義令牌登入 Firebase
          try {
            await firebase.auth().signInWithCustomToken(customToken);
            console.log('用戶登入成功');
            setShowWalletModal(false);
          } catch (error) {
            console.log('用戶登入失敗:', error);
          }
          setIsLoadings(false);
          setUser(walletAddress);
          setWalletAddress(walletAddress);
          await createUserdata();
          navigate("/home");
          console.log("123", walletAddress);
        } else {
          setUser("");
          console.log('Error:', response.status);
        }
      } catch (error) {
        setUser("");
        console.error("錢包連接錯誤:", error);
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
      const doucumentRef = await db.collection('userdata').where('author.uid', '==', walletAddress).get();

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
        console.log(user.uid);
      }
    }
  }

  const disconnect = async () => {
    try {
      await firebase.auth().signOut();
      setUser('');
      navigate("/");
    } catch (error) {
      console.log("登出失敗:", error);
    }

  };

  return (
    <Segment inverted className={styles.segment}>
      <div className={styles.overlay1} style={{ display: showWalletModal ? 'block' : 'none' }} onClick={() => setShowWalletModal(false)} />
      <Menu className={styles.menu}>
        <Menu.Menu className={styles.leftmenu}>
          {user ? (
            <>
              <Menu.Item className={styles.leftitem} as={Link} to="/home">
                Home
              </Menu.Item>
              <Menu.Item className={styles.leftitem} as={Link} to="/SortableTest">拖曳測試<BsChevronDown className={styles.icon} /></Menu.Item>
              <Menu.Item className={styles.popupitem} >
                <Popup className={styles.leftpopup}
                  content={
                    <Menu vertical className={styles.lvertical}>
                      <Menu.Item className={styles.verticalitem1}>建立看板</Menu.Item>
                      <Menu.Item className={styles.verticalitem2}>建立工作區</Menu.Item>
                    </Menu>
                  }
                  on="click"
                  pinned
                  position="bottom left"
                  trigger={
                    <span>
                      <Button className={styles.lbutton} >建立</Button>
                    </span>
                  }
                />
              </Menu.Item>

            </>
          ) : (
            <>
              <Menu.Item className={styles.leftitem} as={Link} to="/">
                Home
              </Menu.Item>
              <Menu.Item className={styles.leftitem} >特徵</Menu.Item>
              <Menu.Item className={styles.leftitem} >計畫</Menu.Item>
            </>
          )}
        </Menu.Menu>
        <Menu.Menu className={styles.rightmenu} >
          {user ? (
            <>
              <Menu.Item className={styles.wrapitem}>
                <div className={styles.search}>
                  <input className={styles.searchTerm} />
                  <button className={styles.searchButton}>
                    <FiSearch></FiSearch>
                  </button>
                </div>
              </Menu.Item>
              <Menu.Item className={styles.rightitem} as={Link} to="/MySettings">
                人員
              </Menu.Item>

              <Menu.Item className={styles.rightitem} >
                <Popup className={styles.rightpopup}
                  content={
                    <Menu vertica className={styles.rvertical}>
                      <Menu.Item className={styles.verticalitem1} onClick={disconnect}>中斷錢包連結</Menu.Item>
                    </Menu>
                  }
                  on="click"
                  pinned
                  position="bottom right"
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
            </>
          ) : (
            <Button className={styles.rbutton} onClick={handleButtonClick} style={{ fontWeight: 'bold' }}>
              Connect Wallet
            </Button>
          )}
        </Menu.Menu>
      </Menu>

      {/* 錢包選擇 */}
      <Modal className={styles.modal} onClose={() => setShowWalletModal(false)} open={showWalletModal}>
        <Modal.Header className={styles.modalHeader}>Connect Wallet</Modal.Header>
        <Modal.Content className={styles.connect}>
          {/* 在這裡添加用戶選擇錢包的選項，並處理相應的登入邏輯 */}
          <Button
            className={`${styles.modalbutton} ${isLoadings ? styles.loading : ''}`}
            onClick={connect}
            loading={isLoadings}
          >
            <Image className={styles.image} src={Meta} avatar />
            {isLoadings ? <ImSpinner className={styles.spinner} /> : 'MetaMask'}
            <FaArrowRight className={styles.arrowright} />
          </Button>
        </Modal.Content>
      </Modal>
    </Segment >
  );
}

export default Header;
