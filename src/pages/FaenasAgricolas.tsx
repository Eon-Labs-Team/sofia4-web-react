import React from 'react';
import WorkManager from './Work/WorkManager';

/**
 * Página principal para gestión de faenas agrícolas
 * Permite gestionar todos los tipos de trabajo: Aplicación (A), Cosecha (C), y Trabajo Agrícola (T)
 */
const FaenasAgricolas: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <WorkManager 
        defaultWorkType="T"
        hideTypeSelector={true}
      />
    </div>
  );
};

export default FaenasAgricolas;