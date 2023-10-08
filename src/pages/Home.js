import React, { useState } from "react";
import { Grid, List,Divider,Button,Icon,Modal,Header, Form } from "semantic-ui-react";
import Workspace from "../components/Workspace";
import firebase from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import "firebase/auth";

function Home(){
    const navigate = useNavigate();
    const [openworkspace, setOpenWorksapce] = useState(false);//工作區
    const [openkanban, setOpenKanban] = useState(false);//工作區

    const [isLoading, setIsLoading] = React.useState(false);
    const [topics,settopics] = useState([]);
    const [topicsname,settopicsname] = useState("");

    const [workspacename, setworkspacename] = useState("");
    const [workspaceinf, setworkspaceinf] = useState("");
    
    const[workspace,setworkspace] = React.useState([]);
    const[workspaceid,setworkspaceid] = React.useState("0X");//不能設空字串 

    const [canbanname,setcanbanname] = useState("");
    const [canbanoption,setcanbanoption] = useState("");
    const [canbandata,setcanbandata] = useState([]);//將獲取到的看板資訊設置到裡面
    const [clickcanbanid,setclickcanbanid] = useState("");//點選的工作區ID

    const [permissions,setpermissions] = useState([]);
    const [permissionsname,setpermissionsname] = useState("");


    const handleIconClick = () => {
    setOpenWorksapce(true);  
    };

    //選取工作區處理
    const handleSelectWorkspace = ()=>{
      console.log('點選工作區:');
      console.log(canbandata);
      console.log(workspace);
    };

    //選取看板處理 
    const handleSelectCanban = (item) =>{
      console.log("點選到看板id",item.id);
      console.log("點選到看板name",item.canbanname);
      setclickcanbanid(item.id);
      console.log("點選的看板ID:",clickcanbanid);
      navigate("/Canbanpage");
    };

    // const handleAddKanban = (id) => {
    //   setOpenKanban(true);
    //   console.log('點擊的文件 id:', id);
    // };

    const handleKanbanclick = (id)=>{
      console.log('點擊的文件 id:', id);
      setOpenKanban(true);
      setworkspaceid(id);
      console.log('testid',workspaceid);
    };
    
    //工作區類型選擇
    const options = topics.map(topics =>{
        return{
            text:topics.name,
            value:topics.name
        }
    })

    //工作區選擇
    const wsoptions = workspace.map(workspace =>{
        return{
          text:workspace.workspacename,
          value:workspace.workspacename
        }
    })

    //權限選擇 
    const permissionsoption = permissions.length > 0 ? permissions.map(permissions => ({
      text: permissions.name,
      value: permissions.name
    })) : [];
    

    const user = firebase.auth().currentUser;

    //抓取worktopics 
    React.useEffect(() =>{
        firebase
        .firestore()
        .collection('worktopics')//指定要抓資料的集合
        .get()
        .then((collectionSnapshot) =>{//獲得集合快照的物件
          const data = collectionSnapshot.docs.map((doc) =>{//獲得文件快照的陣列
              return doc.data();
          });
          console.log("工作區類別:",data);
          settopics(data);
        });
      },[]);
    
      //抓取permissions
     React.useEffect(() =>{
      firebase
      .firestore()
      .collection('permissions')//指定要抓資料的集合
      .get()
      .then((collectionSnapshot) =>{//獲得集合快照的物件
        const data = collectionSnapshot.docs.map((doc) =>{//獲得文件快照的陣列
            return doc.data();
        });
        console.log("權限:",data);
        setpermissions(data);
      });
    },[]);

    //抓取workspace
    React.useEffect(() => {
      const query = firebase
        .firestore()
        .collection('workspace')
        .where('author.uid', '==', user.uid);
      const unsubscribe = query.onSnapshot((querySnapshot) => {
        const data = querySnapshot.docs.map((docSnapshot) => {
          const id = docSnapshot.id;
          return {...docSnapshot.data(),id};
        });
        setworkspace(data);
        console.log("工作區資料:",data);
      });
      return () => {
        // 在組件卸載時取消監聽
        unsubscribe();
      };
    }, []);
  
    // 抓取看板 
    React. useEffect(() => {
      const query = firebase
        .firestore()
        .collection('workspace')
        .where('author.uid', '==', user.uid);
  
      const unsubscribe = query.onSnapshot((querySnapshot) => {
        const promises = querySnapshot.docs.map((docSnapshot) => {
          const id = docSnapshot.id;
          const subcollectionQuery = firebase
            .firestore()
            .collection('workspace')
            .doc(id)
            .collection('canban');
  
          subcollectionQuery.onSnapshot((subcollectionSnapshot) => {
            const subcollectionData = subcollectionSnapshot.docs.map((subDocSnapshot) => {
              const subDocId = subDocSnapshot.id;
              const subDocData = subDocSnapshot.data();
              return { id: subDocId, ...subDocData };
            });
  
            setcanbandata((prevData) => {
              // Filter out existing data to prevent duplicates
              const newData = subcollectionData.filter(
                (item) => !prevData.some((existingItem) => existingItem.id === item.id)
              );
  
              return [...prevData, ...newData];
            });
          });
        });
      });
      return () => {
        unsubscribe();
      };
    }, []);
  
    
    
    
    React.useEffect(() => {
      console.log("canbandata 狀態變化:", canbandata);
      // 在這裡處理你希望在 canbandata 變化時執行的操作
    }, [canbandata]);
  
    //按鈕事件 新增工作區
    function onSubmitAddworkspace(){
      setIsLoading(true);
      const doucumentRef = firebase.firestore().collection("workspace").doc();
      doucumentRef.set({
        workspacename:workspacename,
        topics:topicsname,
        content:workspaceinf,
        createdAT:firebase.firestore.Timestamp.now(),
        author:{
          uid:firebase.auth().currentUser.uid,
          photoURL:firebase.auth().currentUser.photoURL || "",
          displayname:firebase.auth().currentUser.displayName || "",
        },
      })
      .then(() => {
        setIsLoading(false);
        setOpenWorksapce(false); // 關閉 Modal
        setworkspacename('');
        settopicsname('');
        setworkspaceinf('');
        navigate("/home");
      });
    }

    //按鈕事件 新增看板
    function onSubmitAddcanban(){
      setIsLoading(true);
      console.log("看板名:",canbanname);
      console.log("看板選擇:",canbanoption);
      console.log("權限選擇:",permissionsname);

      const doucumentRef = firebase.firestore().collection("workspace").doc(workspaceid).collection("canban").doc();
      doucumentRef.set({
        workspaceId:workspaceid,
        canbanname:canbanname,
        canbanoption:canbanoption,
        permissions:permissionsname,
        createdAT:firebase.firestore.Timestamp.now(),
        author:{
          uid:firebase.auth().currentUser.uid,
          photoURL:firebase.auth().currentUser.photoURL || "",
          displayname:firebase.auth().currentUser.displayName || "",
        },
      })
      .then(() => {
        setIsLoading(false);
        setOpenKanban(false); // 關閉 Modal
        setcanbanname('');
        setcanbanoption('');
        setpermissions('');
        navigate("/home");
      });
    }

    return <Grid style={{  }}>
        {/* 預設切成16等份 */}
        <Grid.Row>
        <Grid.Column width={3}>左空白</Grid.Column>
            <Grid.Column width={2}>
                <List animated selection>
                    <List.Item >
                        看板
                    </List.Item>
                    <List.Item>
                        範本
                    </List.Item>
                    <List.Item>
                        首頁
                    </List.Item>
                    <Divider/>
                </List>
                <List >
                    <List.Item>
                      工作區 
                     <Button icon floated="right" onClick={handleIconClick}>
                        <Icon name='plus' />
                    </Button>
                    </List.Item>
                </List>
                <List animated selection>
                  {workspace.map((post, index) => (
                      <List.Item key={index} onClick={ () => handleSelectWorkspace(post)}>
                          {post.workspacename}
                         
                      </List.Item>
                    ))}
                  
                </List>
                <Workspace />
            </Grid.Column>
            <Grid.Column width={8}>
              <Header>您的工作區</Header>
              {workspace.map(({ id: workspaceId, workspacename }, index) => (
              <div key={index}>
                <Header>{workspacename}</Header>
                  <List>
                    <Button icon onClick={() => handleKanbanclick(workspaceId)}>
                      <Icon name='plus' />
                    </Button>
                  </List>

                 <List animated selection>
                    {canbandata
                      .filter((item) => item.workspaceId === workspaceId)
                      .map((item) => (
                        <List.Item key={item.id} onClick={() => handleSelectCanban(item)}>
                          {item.canbanname}
                        </List.Item>
                      ))}
                </List>
              </div>
            ))}




            </Grid.Column>
            <Grid.Column width={3}>又空白
            <div>
                {canbandata.map((post) => (
                    <div key={post.id}>
                        {post.canbanname}
                    </div>
                ))}
            </div>
            <div>
                {workspace.map((post) => (
                    <div key={post.id}>
                        {post.workspacename}
                    </div>
                ))}
                </div>
            </Grid.Column>
        </Grid.Row>
        {/* 工作區 */}
        <Modal onClose={() => setOpenWorksapce(false)} open={openworkspace}>
        <Modal.Header></Modal.Header>
          <Modal.Description>
            <Header>讓我們開始打造一個工作區吧</Header>
            <p>讓大家更容易在同一位置存取看板，以提高你的工作效率。</p>
            <Form onSubmit={onSubmitAddworkspace}>
                <Form.Input 
                label ="工作區名稱"
                placeholder="公司名稱" 
                value = {workspacename}
                onChange={(e) => setworkspacename(e.target.value)}
                /> 
                {/* Form.Dropdown提供一個參數，會有個物件value的key，再把他set回topicsanme */}
                <Form.Dropdown
                    label="工作區類型"
                    placeholder="選擇公司類型"
                    options={options}
                    selection
                    value={topicsname}
                    onChange={(e,{value}) => settopicsname(value)}
                />
                {/* 多行內容.TextArea */}
                <Form.TextArea
                label="工作區描述"
                size="big"
                placeholder="我們的團隊在此將一切打理的...."
                value = {workspaceinf}
                onChange={(e) => setworkspaceinf(e.target.value)}
                />
                <Form.Button loading={isLoading}>送出</Form.Button>
            </Form>
          </Modal.Description>
      </Modal>

      {/* 看板 */}
      <Modal onClose={() => setOpenKanban(false)} open={openkanban}>
        <Modal.Header></Modal.Header>
          <Modal.Description>
            <Header>建立看板</Header>
            <Form onSubmit={onSubmitAddcanban}>
                <Form.Input 
                label ="看板名稱"
                placeholder="看板名稱" 
                value = {canbanname}
                onChange={(e) => setcanbanname(e.target.value)}
                /> 
                {/* Form.Dropdown提供一個參數，會有個物件value的key，再把他set回topicsanme */}
                <Form.Dropdown
                    label="工作區"
                    placeholder="選擇工作區"
                    options={wsoptions}
                    selection
                    value={canbanoption}
                    onChange={(e,{value}) => setcanbanoption(value)}
                />
                {/* 權限 */}
                 <Form.Dropdown
                    label="查看權限"
                    placeholder="選擇權限"
                    options={permissionsoption}
                    selection
                    value={permissionsname}
                    onChange={(e,{value}) => setpermissionsname(value)}
                />

                <Form.Button loading={isLoading}>建立</Form.Button>
            </Form>
          </Modal.Description>
      </Modal>
    </Grid>
}

export default Home;