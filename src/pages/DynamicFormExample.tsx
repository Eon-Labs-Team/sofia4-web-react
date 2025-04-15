import React from "react";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";

// Example grid data for nested grid
const gridData = [
  { id: 1, name: "Item 1", category: "Category A", price: 100 },
  { id: 2, name: "Item 2", category: "Category B", price: 200 },
  { id: 3, name: "Item 3", category: "Category A", price: 150 },
];

// Example grid columns
const gridColumns = [
  { id: "id", header: "ID", accessor: "id", visible: true, sortable: true },
  {
    id: "name",
    header: "Name",
    accessor: "name",
    visible: true,
    sortable: true,
  },
  {
    id: "category",
    header: "Category",
    accessor: "category",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "price",
    header: "Price",
    accessor: "price",
    visible: true,
    sortable: true,
  },
];

// Form sections configuration
const formSections: SectionConfig[] = [
  {
    id: "personal-info",
    title: "Personal Information",
    description: "Please provide your personal details",
    fields: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        name: "name",
        placeholder: "Enter your full name",
        required: true,
        helperText: "Your first and last name",
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        name: "email",
        placeholder: "your.email@example.com",
        required: true,
      },
      {
        id: "phone",
        type: "text",
        label: "Phone Number",
        name: "phone",
        placeholder: "+1 (123) 456-7890",
      },
      {
        id: "birthdate",
        type: "date",
        label: "Date of Birth",
        name: "birthdate",
        required: true,
      },
    ],
  },
  {
    id: "address",
    title: "Address Information",
    description: "Where can we reach you?",
    fields: [
      {
        id: "street",
        type: "text",
        label: "Street Address",
        name: "street",
        placeholder: "123 Main St",
        required: true,
      },
      {
        id: "city",
        type: "text",
        label: "City",
        name: "city",
        placeholder: "Anytown",
        required: true,
      },
      {
        id: "state",
        type: "select",
        label: "State/Province",
        name: "state",
        required: true,
        options: [
          { label: "California", value: "CA" },
          { label: "New York", value: "NY" },
          { label: "Texas", value: "TX" },
          { label: "Florida", value: "FL" },
        ],
      },
      {
        id: "zip",
        type: "text",
        label: "Zip/Postal Code",
        name: "zip",
        placeholder: "12345",
        required: true,
      },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Tell us about your preferences",
    fields: [
      {
        id: "subscribe",
        type: "checkbox",
        label: "Subscribe to newsletter",
        name: "subscribe",
        defaultValue: true,
      },
      {
        id: "contactMethod",
        type: "radio",
        label: "Preferred Contact Method",
        name: "contactMethod",
        options: [
          { label: "Email", value: "email" },
          { label: "Phone", value: "phone" },
          { label: "Text Message", value: "text" },
        ],
        defaultValue: "email",
      },
      {
        id: "interests",
        type: "textarea",
        label: "Interests",
        name: "interests",
        placeholder: "Tell us about your interests...",
        rows: 3,
      },
      {
        id: "notificationFrequency",
        type: "range",
        label: "Notification Frequency",
        name: "notificationFrequency",
        min: 0,
        max: 10,
        step: 1,
        defaultValue: 5,
        helperText: "0 = None, 10 = Frequent",
      },
    ],
  },
  {
    id: "items",
    title: "Items Grid",
    description: "View and manage items",
    fields: [
      {
        id: "itemsGrid",
        type: "grid",
        label: "Items",
        name: "itemsGrid",
        gridConfig: {
          data: gridData,
          columns: gridColumns,
          title: "Available Items",
        },
      },
    ],
  },
  {
    id: "advanced",
    title: "Advanced Fields",
    description: "Try out these advanced field types",
    fields: [
      {
        id: "country",
        type: "autocomplete",
        label: "Country",
        name: "country",
        placeholder: "Select a country",
        helperText: "Start typing to search for a country",
        options: [
          { label: "United States", value: "us" },
          { label: "Canada", value: "ca" },
          { label: "Mexico", value: "mx" },
          { label: "Brazil", value: "br" },
          { label: "Argentina", value: "ar" },
          { label: "Chile", value: "cl" },
          { label: "United Kingdom", value: "uk" },
          { label: "France", value: "fr" },
          { label: "Germany", value: "de" },
          { label: "Spain", value: "es" },
          { label: "Italy", value: "it" },
          { label: "Japan", value: "jp" },
          { label: "China", value: "cn" },
          { label: "India", value: "in" },
          { label: "Australia", value: "au" },
        ],
      },
      {
        id: "searchExample",
        type: "search",
        label: "Search Example",
        name: "searchExample",
        placeholder: "Search for something...",
        helperText: "This is an example of a search field",
      },
    ],
  },
  {
    id: "security",
    title: "Security Verification",
    description: "Please complete the security check",
    fields: [
      {
        id: "captchaVerification",
        type: "captcha",
        label: "CAPTCHA Verification",
        name: "captchaVerification",
        required: true,
        helperText: "Please enter the characters you see in the image",
      },
    ],
  },
];

// Form validation schema
const formValidationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  birthdate: z.date(),
  street: z.string().min(1, { message: "Street address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip: z.string().min(5, { message: "Valid zip code is required" }),
  subscribe: z.boolean().optional(),
  contactMethod: z.enum(["email", "phone", "text"]),
  interests: z.string().optional(),
  notificationFrequency: z.number().min(0).max(10).optional(),
  captchaVerification: z.boolean().refine((val) => val === true, {
    message: "Please complete the CAPTCHA verification",
  }),
  searchExample: z.string().optional(),
  country: z.string().optional(),
});

const DynamicFormExample = () => {
  const handleSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    alert("Form submitted! Check console for data.");
  };

  return (
    <div className="p-6 bg-background">
      <h1 className="text-2xl font-bold mb-6">Dynamic Form Example</h1>
      <DynamicForm
        sections={formSections}
        onSubmit={handleSubmit}
        validationSchema={formValidationSchema}
        defaultValues={{
          contactMethod: "email",
          subscribe: true,
          notificationFrequency: 5,
        }}
      />
    </div>
  );
};

export default DynamicFormExample;
