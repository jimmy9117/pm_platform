import React from "react";
import { Menu, Popup,Search,Button,Sidebar,Icon} from "semantic-ui-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { hasFormSubmit } from "@testing-library/user-event/dist/utils";


function CanbanHeader(props){
   
    return(
        <Menu>
            <Button onClick={props.handleIconClick}>
                <Icon name="angle double right" size="large"/>
            </Button>
           
            <Menu.Menu position="left">
             
               
                <Menu.Item>
                  團隊名稱
                </Menu.Item>


            </Menu.Menu>


        </Menu>


    );
}


export default CanbanHeader;
