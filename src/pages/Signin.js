import React, { useState } from "react";
import { Menu, Form, Container, Message } from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import firebase from "../utils/firebase";
import "firebase/auth";
import Home from "./Home";

function Signin() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function createUserdata() {
    const doucumentRef = firebase.firestore().collection("userdata").doc();
    const userData = {
      name: "",
      email: email,
      createdAT: firebase.firestore.Timestamp.now(),
      author:{
        displayName: firebase.auth().currentUser.displayName || "",
        uid: firebase.auth().currentUser.uid,
        email: firebase.auth().currentUser.email,
      },
    };
    return doucumentRef.set(userData);
  }

  function onSubmit() {
    setIsLoading(true);

    if (activeItem === "register") {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          //成功創建user之後再firebase裡在新增一個userdata
          createUserdata().then(() => {
            navigate("/");
            setIsLoading(false);
          });
        })
        .catch((error) => {
          // Handle error and set error message
          switch (error.code) {
            case "auth/email-already-in-use":
              setErrorMessage("信箱已存在");
              break;
            case "auth/invalid-email":
              setErrorMessage("信箱格式不正確");
              break;
            case "auth/weak-password":
              setErrorMessage("密碼強度不足");
              break;
            default:
              setErrorMessage("註冊失敗");
          }

          setIsLoading(false);
        });
    } else if (activeItem === "signin") {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          navigate("/home");
          setIsLoading(false);
        })
        .catch((error) => {
          // Handle error and set error message
          switch (error.code) {
            case "auth/invalid-email":
              setErrorMessage("信箱格式不正確");
              break;
            case "auth/user-not-found":
              setErrorMessage("信箱不存在");
              break;
            case "auth/wrong-password":
              setErrorMessage("密碼錯誤");
              break;
            default:
              setErrorMessage("登入失敗");
          }

          setIsLoading(false);
        });
    }
  }

  return (
    <>
      <Container>
        <Menu widths="2">
          <Menu.Item
            active={activeItem === "register"}
            onClick={() => {
              setErrorMessage("");
              setActiveItem("register");
            }}
          >
            註冊
          </Menu.Item>
          <Menu.Item
            active={activeItem === "signin"}
            onClick={() => {
              setErrorMessage("");
              setActiveItem("signin");
            }}
          >
            登入
          </Menu.Item>
        </Menu>
        <Form onSubmit={onSubmit}>
          <Form.Input
            label="信箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="請輸入信箱"
          />
          <Form.Input
            label="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="請輸入密碼"
            type="password"
          />
          {errorMessage && <Message negative>{errorMessage}</Message>}
          <Form.Button loading={isLoading}>
            {activeItem === "register" && "註冊"}
            {activeItem === "signin" && "登入"}
          </Form.Button>
        </Form>
      </Container>
    </>
  );
}

export default Signin;
