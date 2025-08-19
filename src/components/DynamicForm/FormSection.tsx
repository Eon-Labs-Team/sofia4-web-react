import React from "react";
import { SectionConfig, FieldConfig } from "./DynamicForm";
import FormField from "./FormField";

interface FormSectionProps {
  section: SectionConfig;
  index: number;
}

const FormSection: React.FC<FormSectionProps> = ({
  section,
  index,
}) => {

  return (
    <div className="border rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{section.title}</h3>
        {section.description && (
          <p className="text-sm text-muted-foreground">
            {section.description}
          </p>
        )}
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
