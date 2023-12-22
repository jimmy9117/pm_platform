import React, { useState } from "react";
import { Container, Grid, List, Header, Button, Modal } from "semantic-ui-react";
import { useLocation, useNavigate } from "react-router-dom";
import firebase from "../utils/firebase";
import "firebase/auth";
import styles from "./Settings.module.css";
import SidebarExampleVisible from "./Siderbar";

function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const { data } = location.state || {};
    const workspacename = data?.workspacename;
    const wpid = data?.workspaceid;

    const [opendelModal, setopendelModal] = useState(false);


    const handleDeleteDocument = async (workspaceId) => {
        // 在判斷中檢查 wpid 是否等於 workspaceId
        if (wpid === workspaceId) {
            const workspaceRef = firebase
                .firestore()
                .collection('workspace')
                .doc(workspaceId)

            try {
                // 刪除文檔
                await workspaceRef.delete();
                console.log('文檔已成功刪除');
                // 刪除成功後，導航到其他頁面，例如首頁
                navigate('/Home');
            } catch (error) {
                console.error('刪除文檔時發生錯誤：', error);
            }
        } else {
            console.log('wpid 不等於 workspaceId，不能刪除文檔');
        }
    };


    return (
        <Grid className={styles.grid}>
            <div className={styles.deloverlay} style={{ display: opendelModal ? 'block' : 'none' }} onClick={() => setopendelModal(false)} />
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
                            <List className={styles.canband} animated selection>
                                <Button className={styles.lbutton} onClick={() => setopendelModal(true)}>
                                    刪除工作區
                                </Button>
                            </List>
                        </Container>
                    </Grid.Column>
                </Container>
                <Modal className={styles.delmodal} onClose={() => setopendelModal(false)} open={opendelModal}>
                    <Modal.Header className={styles.delmodalheader}>確認刪除工作區？</Modal.Header>
                    <Modal.Description>
                        <Button className={styles.lbutton} onClick={() => handleDeleteDocument(wpid)}>確認</Button>
                        <Button className={styles.rbutton} onClick={() => setopendelModal(false)}>再想想</Button>
                    </Modal.Description >
                </Modal >
            </Grid.Row>

        </Grid>


    );
}

export default Settings;
