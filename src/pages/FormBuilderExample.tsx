import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormBuilder from "@/components/DynamicForm/FormBuilder";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const FormBuilderExample = () => {
  const [formSections, setFormSections] = useState<SectionConfig[]>([]);
  const [formJson, setFormJson] = useState("");

  const handleFormChange = (sections: SectionConfig[]) => {
    setFormSections(sections);
    setFormJson(JSON.stringify(sections, null, 2));
  };

  const handleJsonImport = () => {
    try {
      const parsedSections = JSON.parse(formJson);
      setFormSections(parsedSections);
    } catch (error) {
      alert("Invalid JSON format. Please check your input.");
    }
  };

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    alert("Form submitted! Check console for data.");
  };

  return (
    <div className="p-6 bg-background">
      <h1 className="text-2xl font-bold mb-6">Form Builder Example</h1>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          <FormBuilder
            initialSections={formSections}
            onChange={handleFormChange}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {formSections.length > 0 ? (
            <DynamicForm sections={formSections} onSubmit={handleFormSubmit} />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No form sections created yet. Go to the Builder tab to create
                  your form.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="json" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form JSON Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formJson}
                onChange={(e) => setFormJson(e.target.value)}
                className="font-mono text-sm"
                rows={20}
                placeholder="Your form configuration will appear here as JSON"
              />
              <div className="flex justify-end mt-4">
                <Button onClick={handleJsonImport}>Import from JSON</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormBuilderExample;
