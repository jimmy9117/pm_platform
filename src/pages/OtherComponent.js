import React from "react";

import { Container, Grid } from "semantic-ui-react";
import styles from "./Dashboard.module.css";
import SidebarExampleVisible from "./Siderbar";

function OtherComponent() {
  return (
    <Grid className={styles.grid}>
      <Grid.Row className={styles.row}>
        <SidebarExampleVisible />

        <Container className={styles.allboard}>
          <Grid.Column className={styles.column}>
            <Container className={styles.container}>
              要點
            </Container>
            <hr className={styles.hr}/>
            <Container className={styles.container1}>
              123
            </Container>
          </Grid.Column>
        </Container>



      </Grid.Row>
    </Grid>
  );
}

export default OtherComponent;