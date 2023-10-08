import React from 'react';
import { Button, Icon, Menu, Sidebar } from 'semantic-ui-react';

function TestSidebar() {
  const [visible, setVisible] = React.useState(false);

  const handleIconClick = () => {
    setVisible(!visible);
  };

  const VerticalSidebar = () => (
    <Sidebar
      as={Menu}
      animation="push"
      onHide={() => setVisible(false)}
      inverted
      vertical
      visible={visible}
      width="thin"
    >
      <Menu.Item as="a">
        <Icon name="home" />
        Home
      </Menu.Item>
      <Menu.Item as="a">
        <Icon name="gamepad" />
        Games
      </Menu.Item>
      <Menu.Item as="a">
        <Icon name="camera" />
        Channels
      </Menu.Item>
    </Sidebar>
  );

  return (
    <>
      <Button onClick={handleIconClick}>漢堡</Button>
      <VerticalSidebar />
    </>
  );
}

export default TestSidebar;
