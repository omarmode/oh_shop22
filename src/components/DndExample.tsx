"use client";
import { useEffect, useState } from "react";
import { cardsData } from "./cardsData";
import axios from "axios";

import {
  Draggable,
  DragDropContext,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import LoadingSkeleton from "./LoadingSkeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Image {
  src: string;
  originalSection: string;
  content: string;
}

interface Component {
  id: number;
  name: string;
  images: Image[];
}

interface Cards {
  id: number;
  title: string;
  components: Component[];
}

const DndExample = () => {
  const [data, setData] = useState<Cards[]>([]);
  const [previewSections, setPreviewSections] = useState<Set<string>>(
    new Set()
  );

  // دالة لإرسال البيانات إلى الـ API باستخدام Axios
  const saveChangesToApi = async (dataToSave: any) => {
    try {
      const response = await axios.post(
        "https://app.onshophq.com/api/store/configs", // Replace with your actual API endpoint
        dataToSave,
        {
          headers: {
            "store-id": 7, // Add the store-id header
          },
        }
      );
      console.log("Response from API:", response.data);
      // You can add code here to handle the successful response from the server
    } catch (error) {
      console.error("Error sending data to API:", error);
      // You can add code here to handle errors
    }
  };

  // دالة للتعامل مع النقر على زر الحفظ
  const handleClickSaveChanges = () => {
    // العثور على بيانات قسم المعاينة
    const previewData = data.find((card) => card.id === 3);

    if (previewData) {
      const dataToLog = {
        components: [
          {
            name: previewData.components[0].name,
            images: previewData.components[0].images.map((img) => ({
              content: img.content,
              originalSection: img.originalSection,
            })),
          },
        ],
      };

      console.log("Preview section data:", dataToLog);

      // إرسال البيانات إلى الـ API عند النقر على زر الحفظ
      saveChangesToApi(dataToLog); // تمرير dataToSave كوسيط للدالة
    } else {
      console.warn("Preview section data not found.");
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceDroppableId = parseInt(
      source.droppableId.replace("droppable", "")
    );
    const destinationDroppableId = parseInt(
      destination.droppableId.replace("droppable", "")
    );

    const newData = [...data];
    const sourceIndex = newData.findIndex((x) => x.id === sourceDroppableId);
    const destinationIndex = newData.findIndex(
      (x) => x.id === destinationDroppableId
    );

    if (sourceDroppableId === destinationDroppableId) {
      // Handle reordering within the same droppable
      const [movedImage] = newData[sourceIndex].components[0].images.splice(
        source.index,
        1
      );
      newData[sourceIndex].components[0].images.splice(
        destination.index,
        0,
        movedImage
      );
    } else if (destinationDroppableId === 3) {
      // Allow dragging one image from each main section to preview
      const movedImage =
        newData[sourceIndex].components[0].images[source.index];
      const sectionName = newData[sourceIndex].title.toLowerCase();

      // Check if there is already an image from the same section in the preview
      if (previewSections.has(sectionName)) {
        return;
      }

      if (newData[destinationIndex].components.length === 0) {
        newData[destinationIndex].components.push({
          id: new Date().getTime(),
          name: "preview",
          images: [],
        });
      }

      newData[destinationIndex].components[0].images.push(movedImage);
      newData[sourceIndex].components[0].images.splice(source.index, 1);
      setPreviewSections((prev) => new Set(prev).add(sectionName));
    } else if (sourceDroppableId === 3) {
      // Allow dragging from Preview to only its original section
      const movedImage = newData[sourceIndex].components[0].images.splice(
        source.index,
        1
      )[0];

      // Ensure the image is moved back to its original section only
      const originalSectionIndex = newData.findIndex(
        (x) => x.title === movedImage.originalSection
      );

      if (destinationIndex !== originalSectionIndex) {
        newData[sourceIndex].components[0].images.splice(
          source.index,
          0,
          movedImage
        );
        return;
      }

      newData[destinationIndex].components[0].images.push(movedImage);

      // Update previewSections set if moving image out of preview
      const sectionName = newData[destinationIndex].title.toLowerCase();
      setPreviewSections((prev) => {
        const newSet = new Set(prev);
        newSet.delete(sectionName);
        return newSet;
      });
    } else {
      // Prevent dragging between main sections
      console.log("Dragging between main sections is not allowed");
      return;
    }

    // Log the updated data excluding src
    const dataToLog = newData.map((card) => ({
      id: card.id,
      title: card.title,
      components: card.components.map((comp) => ({
        id: comp.id,
        name: comp.name,
        images: comp.images.map((img) => ({
          content: img.content,
          originalSection: img.originalSection, // Include originalSection in the log
        })),
      })),
    }));

    console.log("Updated data:", dataToLog);
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
      <div className="bg-gray-300 h-16 flex justify-between items-center px-20">
        <div className="font-bold">On Shop</div>

        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2 px-4 rounded flex items-center"
          onClick={handleClickSaveChanges}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="h-4 w-4 mr-1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          Save Changes
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="py-16 px-4 flex flex-col lg:flex-row gap-4">
          {/* Group 1, Group 2, and Group 3 */}
          <div className="lg:flex lg:flex-col w-full">
            {data.slice(0, 3).map((group) => (
              <Droppable key={group.id} droppableId={`droppable${group.id}`}>
                {(provided) => (
                  <Accordion
                    type="multiple"
                    className="w-full p-4"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <AccordionItem value={group.title.toLowerCase()}>
                      <AccordionTrigger>{group.title}</AccordionTrigger>
                      <AccordionContent>
                        {group.components[0].images.map((image, index) => (
                          <Draggable
                            key={`${group.components[0].id}-${index}`}
                            draggableId={`${group.components[0].id}-${index}`}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="my-3 border-b-2 pb-3"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                              >
                                <img
                                  src={image.src}
                                  alt={`Image ${index}`}
                                  className="rounded-lg shadow-lg"
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </Droppable>
            ))}
          </div>

          {/* Group 4 */}
          <Droppable droppableId={`droppable${data[3].id}`} key={data[3].id}>
            {(provided) => (
              <div
                className="bg-gray-100 rounded-lg shadow-md p-4 w-full"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2 className="text-lg font-medium mb-4">{data[3].title}</h2>
                <div className="grid gap-4">
                  {data[3].components.length > 0 &&
                    data[3].components[0].images.map((image, index) => (
                      <Draggable
                        key={`${data[3].components[0].id}-${index}`}
                        draggableId={`${data[3].components[0].id}-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="mb-4" // Add margin bottom for spacing
                          >
                            <img
                              src={image.src}
                              alt={`Preview Image ${index}`}
                              className="rounded-lg shadow-lg"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
};

export default DndExample;
