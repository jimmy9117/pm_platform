// Droppable.js
import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export function Droppable(props) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });
  const style = {
    background: isOver ? 'lightblue' : 'white',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}
