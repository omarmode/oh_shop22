"use client";
import { cardsData } from "@/bin/CardsData";
import { useEffect, useState } from "react";
import { Draggable, DropResult, Droppable } from "react-beautiful-dnd";
import LoadingSkeleton from "../src/components/LoadingSkeleton";
import { DndContext } from "@/context/DndContext";
import Header from "./Header.tsx";

interface Cards {
  id: number;
  title: string;
  components: {
    id: number;
    name: string;
  }[];
}

const DndExample = () => {
  const [data, setData] = useState<Cards[]>([]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const newData = [...data];
    const sourceIndex = source.index;
    const destinationIndex = destination.index;
    const draggedItem = newData[sourceIndex];

    // Remove from old index
    newData.splice(sourceIndex, 1);
    // Insert at new index
    newData.splice(destinationIndex, 0, draggedItem);

    setData(newData);
  };

  useEffect(() => {
    setData(cardsData);
  }, []);

  if (!data.length) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <DndContext onDragEnd={onDragEnd}>
        <div className="flex">
          {/* Fixed sidebar */}
          <div className="w-1/5 h-screen overflow-y-auto sticky top-0">
            <Droppable droppableId={`droppable0`}>
              {(provided) => (
                <div
                  className="p-3 bg-white min-h-screen overflow-y-auto"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {data[0].components.map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="bg-gray-200 mx-1 px-4 py-3 my-3"
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          {component.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Main content area */}
          <div className="flex-1">
            <Header />
            <div>
              {data.slice(1).map((val, index) => (
                <Droppable key={index + 1} droppableId={`droppable${index + 1}`}>
                  {(provided) => (
                    <div
                      className="p-5 mx-40 my-5 bg-gray-200"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      <div className="bg-white overflow-y-auto min-h-[60vh]">
                        {val.components.map((component, index) => (
                          <Draggable
                            key={component.id}
                            draggableId={component.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="bg-gray-200 mx-1 px-4 py-3 m-1"
                                {...provided.dragHandleProps}
                                {...provided.draggableProps}
                                ref={provided.innerRef}
                              >
                                {component.name}
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </div>
        </div>
      </DndContext>
    </>
  );
};

export default DndExample;
