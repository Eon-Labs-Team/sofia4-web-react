import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { SectionConfig, FieldConfig } from "./DynamicForm";
import FormField from "./FormField";

interface FormSectionProps {
  section: SectionConfig;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  index,
  moveSection,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Set up drag and drop functionality
  const [{ isDragging }, drag] = useDrag({
    type: "SECTION",
    item: { type: "SECTION", id: section.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: "SECTION",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveSection(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`border rounded-lg p-4 ${isDragging ? "opacity-50" : ""}`}
      data-handler-id={handlerId}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{section.title}</h3>
          {section.description && (
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
        </div>
        <div className="cursor-move p-2 hover:bg-muted rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 9l4-4 4 4" />
            <path d="M5 15l4 4 4-4" />
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {section.fields.map((field) => (
          <FormField key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
};

export default FormSection;
