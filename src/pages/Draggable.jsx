// Draggable.js
import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export function Draggable(props) {
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging, // 新增追踪拖拽狀態
  } = useDraggable({
    id: props.id,
    onDragStart: (event) => {
      console.log('Drag start from Draggable component');
      if (props.onDragStart) {
        props.onDragStart(event);
      }
    },
  });

  const style = {
    ...transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined,
    // 新增透明度變化
     opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}
