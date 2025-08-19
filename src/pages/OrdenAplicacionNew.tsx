import React from "react";
import WorkManager from "./Work/WorkManager";

/**
 * Componente de compatibilidad para OrdenAplicacion
 * 
 * Este componente mantiene la funcionalidad original de OrdenAplicacion.tsx
 * pero utiliza la nueva arquitectura desacoplada del sistema Work.
 * 
 * Solo muestra trabajos de tipo 'A' (Aplicaciones) y oculta el selector
 * de tipos para mantener la experiencia de usuario original.
 */
const OrdenAplicacionNew: React.FC = () => {
  return (
    <WorkManager 
      defaultWorkType="A"
      hideTypeSelector={true}
    />
  );
};

export default OrdenAplicacionNew;