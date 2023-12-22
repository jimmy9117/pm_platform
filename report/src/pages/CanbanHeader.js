import React from "react";
import { Menu, Button, Container } from "semantic-ui-react";
import { BsChevronRight } from "react-icons/bs";
import styles from './CanbanHeader.module.css';


function CanbanHeader(props) {

    

    return (
        <Menu>
            <Container className={styles.sbcontainer}>
                <div className={styles.div}>
                    <Button className={`${styles.sidebarbutton} ${props.isActive ? styles.active : ''}`} onClick={props.handleIconClick}>
                        <BsChevronRight className={`${styles.sidebaricon} ${props.isActive ? styles.rotate : ''}`} />
                    </Button>
                </div>
            </Container>

            <Menu.Menu position="left">


                <Menu.Item className={styles.teamname}>
                    {props.canbanname}
                </Menu.Item>


            </Menu.Menu>


        </Menu>


    );
}


export default CanbanHeader;
