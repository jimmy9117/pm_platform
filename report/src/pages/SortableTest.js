import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';

import { Droppable } from './Droppable';
import { Draggable } from './Draggable';
import './test.css';

function SortableTest() {
  const [containersA, setContainersA] = useState(['A', 'B', 'C', 'D', 'E', 'F']);
  const [containersB, setContainersB] = useState(['G', 'H', 'I', 'J', 'K', 'L']);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Container title="Container A" items={containersA} setItems={setContainersA} />
      <Container title="Container B" items={containersB} setItems={setContainersB} />
    </DndContext>
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!over) return;

    if (containersA.includes(active.id)) {
      if (containersB.includes(over.id)) {
        setContainersA(prev => prev.filter(item => item !== active.id));
        setContainersB(prev => [...prev, active.id]);
      } else {
        const updated = [...containersA];
        const from = updated.indexOf(active.id);
        const to = updated.indexOf(over.id);
        updated.splice(from, 1);
        updated.splice(to, 0, active.id);
        setContainersA(updated);
      }
    } else if (containersB.includes(active.id)) {
      if (containersA.includes(over.id)) {
        setContainersB(prev => prev.filter(item => item !== active.id));
        setContainersA(prev => [...prev, active.id]);
      } else {
        const updated = [...containersB];
        const from = updated.indexOf(active.id);
        const to = updated.indexOf(over.id);
        updated.splice(from, 1);
        updated.splice(to, 0, active.id);
        setContainersB(updated);
      }
    }
  }
}

function Container({ title, items, setItems }) {
  return (
    <div className='outwide'>
      <div className="container">
        <h2>{title}</h2>
        <div className="draggable-container">
          {items.map((id) => (
            <Droppable key={id} id={id}>
              <Draggable id={id}>{id}</Draggable>
            </Droppable>
          ))}
        </div>
      </div>
    </div>
  );
}


export default SortableTest;
