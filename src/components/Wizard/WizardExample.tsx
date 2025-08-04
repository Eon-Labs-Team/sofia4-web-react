import React from "react";
import { z } from "zod";
import { Wizard } from "./index";
import { WizardStepConfig } from "./types";

// Esquemas de validación para cada paso
const personalInfoSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido"),
  lastName: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

const companyInfoSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es requerido"),
  position: z.string().min(1, "El cargo es requerido"),
  department: z.string().optional(),
  salary: z.number().positive("El salario debe ser positivo").optional(),
});

const preferencesSchema = z.object({
  notifications: z.boolean().default(true),
  newsletter: z.boolean().default(false),
  theme: z.enum(["light", "dark", "auto"]).default("auto"),
});

// Configuración de los pasos del wizard
const wizardSteps: WizardStepConfig[] = [
  {
    id: "personal-info",
    title: "Información Personal",
    description: "Ingrese sus datos personales básicos",
    validationSchema: personalInfoSchema,
    sections: [
      {
        id: "personal-data",
        title: "Datos Personales",
        description: "Complete su información personal",
        fields: [
          {
            id: "firstName",
            type: "text",
            label: "Nombre",
            name: "firstName",
            placeholder: "Ingrese su nombre",
            required: true,
            helperText: "Su nombre de pila"
          },
          {
            id: "lastName",
            type: "text",
            label: "Apellido",
            name: "lastName",
            placeholder: "Ingrese su apellido",
            required: true,
            helperText: "Su apellido"
          },
          {
            id: "email",
            type: "email",
            label: "Email",
            name: "email",
            placeholder: "ejemplo@correo.com",
            required: true,
            helperText: "Su dirección de correo electrónico"
          },
          {
            id: "phone",
            type: "text",
            label: "Teléfono",
            name: "phone",
            placeholder: "+56 9 1234 5678",
            required: false,
            helperText: "Su número de teléfono (opcional)"
          }
        ]
      }
    ]
  },
  {
    id: "company-info",
    title: "Información Laboral",
    description: "Datos sobre su trabajo actual",
    validationSchema: companyInfoSchema,
    sections: [
      {
        id: "work-data",
        title: "Datos Laborales",
        description: "Información sobre su empleo actual",
        fields: [
          {
            id: "companyName",
            type: "text",
            label: "Empresa",
            name: "companyName",
            placeholder: "Nombre de su empresa",
            required: true,
            helperText: "Nombre de la empresa donde trabaja"
          },
          {
            id: "position",
            type: "text",
            label: "Cargo",
            name: "position",
            placeholder: "Su cargo actual",
            required: true,
            helperText: "Su posición en la empresa"
          },
          {
            id: "department",
            type: "text",
            label: "Departamento",
            name: "department",
            placeholder: "Departamento (opcional)",
            required: false,
            helperText: "Departamento al que pertenece"
          },
          {
            id: "salary",
            type: "number",
            label: "Salario (CLP)",
            name: "salary",
            placeholder: "0",
            required: false,
            helperText: "Su salario mensual (opcional)",
            // Ejemplo de reactividad: formatear el campo de salario
            onChange: (value, setValue, getValues) => {
              if (value && typeof value === "number") {
                // Aquí podrías aplicar formateo o cálculos adicionales
                console.log("Salario actualizado:", value);
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: "preferences",
    title: "Preferencias",
    description: "Configure sus preferencias del sistema",
    validationSchema: preferencesSchema,
    isOptional: true,
    sections: [
      {
        id: "user-preferences",
        title: "Configuración",
        description: "Personalice su experiencia",
        fields: [
          {
            id: "notifications",
            type: "checkbox",
            label: "Recibir Notificaciones",
            name: "notifications",
            required: false,
            helperText: "Recibir notificaciones del sistema"
          },
          {
            id: "newsletter",
            type: "checkbox",
            label: "Suscribirse al Newsletter",
            name: "newsletter",
            required: false,
            helperText: "Recibir nuestro newsletter semanal"
          },
          {
            id: "theme",
            type: "select",
            label: "Tema",
            name: "theme",
            placeholder: "Seleccione un tema",
            required: false,
            helperText: "Tema de la interfaz",
            options: [
              { value: "light", label: "Claro" },
              { value: "dark", label: "Oscuro" },
              { value: "auto", label: "Automático" }
            ]
          }
        ]
      }
    ]
  }
];

const WizardExample: React.FC = () => {
  const handleWizardComplete = async (data: any) => {
    console.log("Datos del wizard completado:", data);
    
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aquí harías la llamada real a tu API
    alert("¡Wizard completado exitosamente! Revisa la consola para ver los datos.");
  };

  const handleWizardCancel = () => {
    console.log("Wizard cancelado");
    alert("Wizard cancelado");
  };

  return (
    <div className="container mx-auto py-8">
      <Wizard
        title="Registro de Usuario"
        description="Complete los siguientes pasos para crear su cuenta"
        steps={wizardSteps}
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
        defaultValues={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          companyName: "",
          position: "",
          department: "",
          salary: 0,
          notifications: true,
          newsletter: false,
          theme: "auto"
        }}
        showProgress={true}
        allowSkipOptional={true}
        submitButtonText="Crear Cuenta"
        cancelButtonText="Cancelar"
        nextButtonText="Continuar"
        previousButtonText="Volver"
      />
    </div>
  );
};

export default WizardExample;