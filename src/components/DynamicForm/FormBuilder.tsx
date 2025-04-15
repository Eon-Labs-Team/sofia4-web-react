import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, MoveVertical, Edit, Copy } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { SectionConfig, FieldConfig, FieldType } from "./DynamicForm";

interface FormBuilderProps {
  initialSections?: SectionConfig[];
  onChange: (sections: SectionConfig[]) => void;
}

const fieldTypeOptions = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Number", value: "number" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio", value: "radio" },
  { label: "Select", value: "select" },
  { label: "Date", value: "date" },
  { label: "Email", value: "email" },
  { label: "Password", value: "password" },
  { label: "File", value: "file" },
  { label: "Hidden", value: "hidden" },
  { label: "Captcha", value: "captcha" },
  { label: "Range", value: "range" },
  { label: "URL", value: "url" },
  { label: "Search", value: "search" },
  { label: "Autocomplete", value: "autocomplete" },
  { label: "Grid", value: "grid" },
  { label: "Selectable Grid", value: "selectableGrid" },
];

interface DraggableSectionProps {
  section: SectionConfig;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddField: () => void;
  onMoveSection: (dragIndex: number, hoverIndex: number) => void;
  onEditField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
  onDuplicateField: (fieldId: string) => void;
}

const DraggableSection: React.FC<DraggableSectionProps> = ({
  section,
  index,
  onEdit,
  onDelete,
  onDuplicate,
  onAddField,
  onMoveSection,
  onEditField,
  onDeleteField,
  onDuplicateField,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

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
    hover(item: any, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onMoveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <Card
      ref={ref}
      className={`mb-4 ${isDragging ? "opacity-50" : ""}`}
      data-handler-id={handlerId}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{section.title}</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Edit Section"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              title="Duplicate Section"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="Delete Section"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-move"
              title="Drag to Reorder"
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {section.fields.map((field) => (
            <div
              key={field.id}
              className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{field.label}</p>
                <p className="text-xs text-muted-foreground">
                  {field.type} {field.required && "(required)"}
                </p>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditField(field.id)}
                  title="Edit Field"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDuplicateField(field.id)}
                  title="Duplicate Field"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteField(field.id)}
                  title="Delete Field"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={onAddField}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Field
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const FormBuilder: React.FC<FormBuilderProps> = ({
  initialSections = [],
  onChange,
}) => {
  const [sections, setSections] = useState<SectionConfig[]>(initialSections);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(
    null,
  );
  const [editingFieldInfo, setEditingFieldInfo] = useState<{
    sectionIndex: number;
    fieldIndex: number | null;
  } | null>(null);

  // Section state
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");

  // Field state
  const [fieldId, setFieldId] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldPlaceholder, setFieldPlaceholder] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldHelperText, setFieldHelperText] = useState("");
  const [fieldOptions, setFieldOptions] = useState<string>(""); // JSON string of options
  const [fieldGridConfig, setFieldGridConfig] = useState<string>(""); // JSON string of grid configuration

  // Handle section changes
  const handleAddSection = () => {
    setSectionTitle("New Section");
    setSectionDescription("");
    setEditingSectionIndex(null);
  };

  const handleEditSection = (index: number) => {
    const section = sections[index];
    setSectionTitle(section.title);
    setSectionDescription(section.description || "");
    setEditingSectionIndex(index);
  };

  const handleSaveSection = () => {
    const newSections = [...sections];
    const newSection: SectionConfig = {
      id:
        editingSectionIndex !== null
          ? sections[editingSectionIndex].id
          : `section-${Date.now()}`,
      title: sectionTitle,
      description: sectionDescription || undefined,
      fields:
        editingSectionIndex !== null
          ? sections[editingSectionIndex].fields
          : [],
    };

    if (editingSectionIndex !== null) {
      newSections[editingSectionIndex] = newSection;
    } else {
      newSections.push(newSection);
    }

    setSections(newSections);
    onChange(newSections);
    setEditingSectionIndex(null);
    setSectionTitle("");
    setSectionDescription("");
  };

  const handleDeleteSection = (index: number) => {
    const newSections = [...sections];
    newSections.splice(index, 1);
    setSections(newSections);
    onChange(newSections);
  };

  const handleDuplicateSection = (index: number) => {
    const sectionToDuplicate = sections[index];
    const newSection: SectionConfig = {
      ...sectionToDuplicate,
      id: `section-${Date.now()}`,
      title: `${sectionToDuplicate.title} (Copy)`,
      fields: sectionToDuplicate.fields.map((field) => ({
        ...field,
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };

    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
    onChange(newSections);
  };

  const handleMoveSection = (dragIndex: number, hoverIndex: number) => {
    const draggedSection = sections[dragIndex];
    const newSections = [...sections];
    newSections.splice(dragIndex, 1);
    newSections.splice(hoverIndex, 0, draggedSection);
    setSections(newSections);
    onChange(newSections);
  };

  // Handle field changes
  const handleAddField = (sectionIndex: number) => {
    resetFieldState();
    setFieldLabel("New Field");
    setFieldName(`field_${Date.now()}`);
    setEditingFieldInfo({ sectionIndex, fieldIndex: null });
  };

  const handleEditField = (sectionIndex: number, fieldId: string) => {
    const fieldIndex = sections[sectionIndex].fields.findIndex(
      (f) => f.id === fieldId,
    );
    if (fieldIndex === -1) return;

    const field = sections[sectionIndex].fields[fieldIndex];
    setFieldId(field.id);
    setFieldType(field.type);
    setFieldLabel(field.label);
    setFieldName(field.name);
    setFieldPlaceholder(field.placeholder || "");
    setFieldRequired(field.required || false);
    setFieldHelperText(field.helperText || "");

    if (field.options) {
      setFieldOptions(
        JSON.stringify(
          field.options.map((opt) => ({ label: opt.label, value: opt.value })),
        ),
      );
    } else {
      setFieldOptions("");
    }

    if (field.gridConfig) {
      setFieldGridConfig(JSON.stringify(field.gridConfig));
    } else {
      setFieldGridConfig("");
    }

    setEditingFieldInfo({ sectionIndex, fieldIndex });
  };

  const handleSaveField = () => {
    if (!editingFieldInfo) return;

    const { sectionIndex, fieldIndex } = editingFieldInfo;
    const newSections = [...sections];
    const section = newSections[sectionIndex];

    let parsedOptions;
    try {
      parsedOptions =
        fieldOptions && ["select", "radio", "autocomplete"].includes(fieldType)
          ? JSON.parse(fieldOptions)
          : undefined;
    } catch (e) {
      parsedOptions = undefined;
    }

    let parsedGridConfig;
    try {
      parsedGridConfig =
        fieldGridConfig && ["grid", "selectableGrid"].includes(fieldType)
          ? JSON.parse(fieldGridConfig)
          : undefined;
    } catch (e) {
      parsedGridConfig = undefined;
    }

    const newField: FieldConfig = {
      id: fieldId || `field-${Date.now()}`,
      type: fieldType,
      label: fieldLabel,
      name: fieldName,
      placeholder: fieldPlaceholder || undefined,
      required: fieldRequired,
      helperText: fieldHelperText || undefined,
      options: parsedOptions,
      gridConfig: parsedGridConfig,
    };

    if (fieldIndex !== null) {
      section.fields[fieldIndex] = newField;
    } else {
      section.fields.push(newField);
    }

    setSections(newSections);
    onChange(newSections);
    setEditingFieldInfo(null);
    resetFieldState();
  };

  const handleDeleteField = (sectionIndex: number, fieldId: string) => {
    const newSections = [...sections];
    const section = newSections[sectionIndex];
    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex !== -1) {
      section.fields.splice(fieldIndex, 1);
      setSections(newSections);
      onChange(newSections);
    }
  };

  const handleDuplicateField = (sectionIndex: number, fieldId: string) => {
    const newSections = [...sections];
    const section = newSections[sectionIndex];
    const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);

    if (fieldIndex !== -1) {
      const fieldToDuplicate = section.fields[fieldIndex];
      const newField: FieldConfig = {
        ...fieldToDuplicate,
        id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: `${fieldToDuplicate.label} (Copy)`,
      };

      section.fields.splice(fieldIndex + 1, 0, newField);
      setSections(newSections);
      onChange(newSections);
    }
  };

  const resetFieldState = () => {
    setFieldId("");
    setFieldType("text");
    setFieldLabel("");
    setFieldName("");
    setFieldPlaceholder("");
    setFieldRequired(false);
    setFieldHelperText("");
    setFieldOptions("");
    setFieldGridConfig("");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Form Builder</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={handleAddSection}>
                <Plus className="h-4 w-4 mr-2" /> Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSectionIndex !== null
                    ? "Edit Section"
                    : "Add New Section"}
                </DialogTitle>
                <DialogDescription>
                  Configure the section properties.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="section-title">Section Title</Label>
                  <Input
                    id="section-title"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="Enter section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-description">Description</Label>
                  <Textarea
                    id="section-description"
                    value={sectionDescription}
                    onChange={(e) => setSectionDescription(e.target.value)}
                    placeholder="Enter section description (optional)"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingSectionIndex(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveSection}>
                  {editingSectionIndex !== null ? "Update" : "Add"} Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {sections.map((section, index) => (
          <DraggableSection
            key={section.id}
            section={section}
            index={index}
            onEdit={() => handleEditSection(index)}
            onDelete={() => handleDeleteSection(index)}
            onDuplicate={() => handleDuplicateSection(index)}
            onAddField={() => handleAddField(index)}
            onMoveSection={handleMoveSection}
            onEditField={(fieldId) => handleEditField(index, fieldId)}
            onDeleteField={(fieldId) => handleDeleteField(index, fieldId)}
            onDuplicateField={(fieldId) => handleDuplicateField(index, fieldId)}
          />
        ))}

        {sections.length === 0 && (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              No sections added yet. Click "Add Section" to get started.
            </p>
          </div>
        )}

        <Dialog
          open={editingFieldInfo !== null}
          onOpenChange={(open) => !open && setEditingFieldInfo(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFieldInfo?.fieldIndex !== null
                  ? "Edit Field"
                  : "Add New Field"}
              </DialogTitle>
              <DialogDescription>
                Configure the field properties.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="field-type">Field Type</Label>
                  <Select
                    value={fieldType}
                    onValueChange={(value) => setFieldType(value as FieldType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-label">Label</Label>
                  <Input
                    id="field-label"
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    placeholder="Enter field label"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-name">Name</Label>
                  <Input
                    id="field-name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Enter field name (used in form data)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field-placeholder">Placeholder</Label>
                  <Input
                    id="field-placeholder"
                    value={fieldPlaceholder}
                    onChange={(e) => setFieldPlaceholder(e.target.value)}
                    placeholder="Enter placeholder text (optional)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="field-required"
                    checked={fieldRequired}
                    onCheckedChange={(checked) =>
                      setFieldRequired(checked as boolean)
                    }
                  />
                  <Label htmlFor="field-required">Required field</Label>
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="field-helper-text">Helper Text</Label>
                  <Input
                    id="field-helper-text"
                    value={fieldHelperText}
                    onChange={(e) => setFieldHelperText(e.target.value)}
                    placeholder="Enter helper text (optional)"
                  />
                </div>
                {["select", "radio", "autocomplete"].includes(fieldType) && (
                  <div className="space-y-2">
                    <Label htmlFor="field-options">
                      Options (JSON array of label/value pairs)
                    </Label>
                    <Textarea
                      id="field-options"
                      value={fieldOptions}
                      onChange={(e) => setFieldOptions(e.target.value)}
                      placeholder='[{"label":"Option 1","value":"option1"},{"label":"Option 2","value":"option2"}]'
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter options as a JSON array of objects with label and
                      value properties.
                    </p>
                  </div>
                )}

                {["grid", "selectableGrid"].includes(fieldType) && (
                  <div className="space-y-2">
                    <Label htmlFor="field-grid-config">
                      Grid Configuration
                    </Label>
                    <Textarea
                      id="field-grid-config"
                      value={fieldGridConfig}
                      onChange={(e) => setFieldGridConfig(e.target.value)}
                      placeholder={`{
  "columns": [
    {"id": "id", "header": "ID", "accessor": "id"},
    {"id": "name", "header": "Name", "accessor": "name"}
  ],
  "data": [
    {"id": "1", "name": "Item 1"},
    {"id": "2", "name": "Item 2"}
  ],
  "multiSelect": true,
  "searchable": true,
  "maxHeight": 300
}`}
                      rows={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      {fieldType === "selectableGrid"
                        ? "Configure the selectable grid with columns, data, and options for multiSelect, searchable, and maxHeight."
                        : "Configure the grid with columns, data, and any additional display options."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingFieldInfo(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveField}>
                {editingFieldInfo?.fieldIndex !== null ? "Update" : "Add"} Field
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};

export default FormBuilder;
