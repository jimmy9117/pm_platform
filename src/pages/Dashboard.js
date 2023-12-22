import React from "react";
import { Container, Grid, List, Header } from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import firebase from "../utils/firebase";
import "firebase/auth";
import styles from "./Dashboard.module.css";
import SidebarExampleVisible from "./Siderbar";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedWorkspace = location.state?.data;
  const workspacename = selectedWorkspace.workspacename;
  const workspaceId = selectedWorkspace.workspaceid;
  const canbandata = selectedWorkspace.canbandata;

  //選取看板處理 
  const handleSelectCanban = (index) => {
    console.log("點選到看板id", index.id);
    console.log("獲取到workspaceid", index.workspaceId);
    
    console.log("點選到看板name", index.canbanname);
    console.log("index", index);
    // 創建要傳遞的數據對象
    const data = {
      clickcanbanid: index.id,
      clickcanbanname: index.canbanname,
      clickworkspaceid: index.workspaceId,
    };

    // 導航到 Canbanpage 並傳遞數據
    navigate('/Canbanpage', { state: { data } });
  };

  return (
    <Grid className={styles.grid}>
      <Grid.Row className={styles.row}>
        <SidebarExampleVisible />
        <Container className={styles.allboard}>
          <Grid.Column className={styles.column}>
            <Container className={styles.container}>
              <Header className={styles.headeritem}>
                工作區名稱：{workspacename}
              </Header>
            </Container>
            <hr className={styles.hr} />
            <Container className={styles.container1}>
              <Header className={styles.headeritem1}>您的看板</Header>
              <List className={styles.canband} animated selection>
                {canbandata
                  .filter((item) => item.workspaceId === workspaceId)
                  .map((index) => (
                    <List.Item className={styles.canbandname} key={index.id} onClick={() => handleSelectCanban(index)}>
                      {index.canbanname}
                    </List.Item>
                  ))}
              </List>
            </Container>
          </Grid.Column>
        </Container>
      </Grid.Row>
    </Grid>
  );
}

export default Dashboard;
