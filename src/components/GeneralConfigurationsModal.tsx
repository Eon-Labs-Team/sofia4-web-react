import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Briefcase, Building2, Users, ArrowLeft, Package, DollarSign, Ruler, Leaf, Mountain, Thermometer, Wind, Gauge, Users2, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Faenas from "@/pages/Faenas";
import Labores from "@/pages/Labores";
import ProductCategory from "@/pages/ProductCategory";
import CostClassification from "@/pages/CostClassification";
import MeasurementUnits from "@/pages/MeasurementUnits";
import CropType from "@/pages/CropType";
import VarietyType from "@/pages/VarietyType";
import SoilType from "@/pages/SoilType";
import TemperatureUnit from "@/pages/TemperatureUnit";
import PressureUnit from "@/pages/PressureUnit";
import WeatherConditions from "@/pages/WeatherConditions";
import WindConditions from "@/pages/WindConditions";
import MachineryBrand from "@/pages/MachineryBrand";
import MachineryType from "@/pages/MachineryType";
import MaritalStatus from "@/pages/MaritalStatus";

interface GeneralConfigurationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeneralConfigurationsModal = ({ isOpen, onClose }: GeneralConfigurationsModalProps) => {
  const [currentView, setCurrentView] = useState<string>("main");

  const handleNavigateToView = (viewId: string) => {
    setCurrentView(viewId);
  };

  const handleBackToMain = () => {
    setCurrentView("main");
  };

  const handleClose = () => {
    setCurrentView("main");
    onClose();
  };

  const configurationSections = [
    {
      id: "task-management",
      title: "Gestión de Tareas",
      description: "Configuraciones relacionadas con faenas y labores",
      items: [
        {
          id: "faenas",
          title: "Faenas",
          description: "Gestionar tipos de faenas agrícolas",
          icon: <Briefcase className="h-5 w-5" />,
          viewId: "faenas",
        },
        {
          id: "labores",
          title: "Labores",
          description: "Gestionar labores asociadas a las faenas",
          icon: <Building2 className="h-5 w-5" />,
          viewId: "labores",
        },
      ],
    },
    {
      id: "products-costs",
      title: "Productos y Costos",
      description: "Configuraciones de productos y clasificaciones de costos",
      items: [
        {
          id: "productCategory",
          title: "Categorías de Productos",
          description: "Gestionar categorías de productos",
          icon: <Package className="h-5 w-5" />,
          viewId: "productCategory",
        },
        {
          id: "costClassification",
          title: "Clasificaciones de Costos",
          description: "Gestionar clasificaciones de costos",
          icon: <DollarSign className="h-5 w-5" />,
          viewId: "costClassification",
        },
      ],
    },
    {
      id: "agricultural-config",
      title: "Configuración Agrícola",
      description: "Configuraciones específicas del sector agrícola",
      items: [
        {
          id: "cropType",
          title: "Tipos de Cultivo",
          description: "Gestionar tipos de cultivos",
          icon: <Leaf className="h-5 w-5" />,
          viewId: "cropType",
        },
        {
          id: "varietyType",
          title: "Tipos de Variedades",
          description: "Gestionar tipos de variedades",
          icon: <Leaf className="h-5 w-5" />,
          viewId: "varietyType",
        },
        {
          id: "soilType",
          title: "Tipos de Suelo",
          description: "Gestionar tipos de suelo",
          icon: <Mountain className="h-5 w-5" />,
          viewId: "soilType",
        },
      ],
    },
    {
      id: "measurement-units",
      title: "Unidades y Medidas",
      description: "Configuraciones de unidades de medida y condiciones",
      items: [
        {
          id: "measurementUnits",
          title: "Unidades de Medida",
          description: "Gestionar unidades de medida",
          icon: <Ruler className="h-5 w-5" />,
          viewId: "measurementUnits",
        },
        {
          id: "temperatureUnit",
          title: "Unidades de Temperatura",
          description: "Gestionar unidades de temperatura",
          icon: <Thermometer className="h-5 w-5" />,
          viewId: "temperatureUnit",
        },
        {
          id: "pressureUnit",
          title: "Unidades de Presión",
          description: "Gestionar unidades de presión",
          icon: <Gauge className="h-5 w-5" />,
          viewId: "pressureUnit",
        },
        {
          id: "weatherConditions",
          title: "Condiciones Climáticas",
          description: "Gestionar condiciones climáticas",
          icon: <FileText className="h-5 w-5" />,
          viewId: "weatherConditions",
        },
        {
          id: "windConditions",
          title: "Condiciones de Viento",
          description: "Gestionar condiciones de viento",
          icon: <Wind className="h-5 w-5" />,
          viewId: "windConditions",
        },
      ],
    },
    {
      id: "machinery-personnel",
      title: "Maquinaria y Personal",
      description: "Configuraciones relacionadas con maquinaria y personal",
      items: [
        {
          id: "machineryBrand",
          title: "Marcas de Maquinaria",
          description: "Gestionar marcas de maquinaria",
          icon: <Building2 className="h-5 w-5" />,
          viewId: "machineryBrand",
        },
        {
          id: "machineryType",
          title: "Tipos de Maquinaria",
          description: "Gestionar tipos de maquinaria",
          icon: <Building2 className="h-5 w-5" />,
          viewId: "machineryType",
        },
        {
          id: "maritalStatus",
          title: "Estados Civiles",
          description: "Gestionar estados civiles",
          icon: <Users2 className="h-5 w-5" />,
          viewId: "maritalStatus",
        },
      ],
    },
    {
      id: "general-settings",
      title: "Otras Configuraciones",
      description: "Configuraciones adicionales del sistema",
      items: [
        {
          id: "wasteType",
          title: "Tipos de Residuos",
          description: "Gestionar tipos de residuos",
          icon: <AlertTriangle className="h-5 w-5" />,
          viewId: "wasteType",
        },
        {
          id: "users",
          title: "Usuarios",
          description: "Gestión de usuarios del sistema",
          icon: <Users className="h-5 w-5" />,
          viewId: "usuarios",
        },
      ],
    },
  ];

  const renderMainView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Configuraciones Generales
        </DialogTitle>
        <DialogDescription>
          Configuraciones que aplican a todos los predios del sistema
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="task-management" className="w-full">
          <TabsList className="grid w-full grid-cols-6 text-xs">
            <TabsTrigger value="task-management">Tareas</TabsTrigger>
            <TabsTrigger value="products-costs">Productos</TabsTrigger>
            <TabsTrigger value="agricultural-config">Agrícola</TabsTrigger>
            <TabsTrigger value="measurement-units">Unidades</TabsTrigger>
            <TabsTrigger value="machinery-personnel">Maquinaria</TabsTrigger>
            <TabsTrigger value="general-settings">Otros</TabsTrigger>
          </TabsList>

          {configurationSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.items.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => handleNavigateToView(item.viewId)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-3">
                            {item.icon}
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="outline" onClick={handleClose}>
          Cerrar
        </Button>
      </div>
    </>
  );

  const renderTasktypeView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
        <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          {/* <Briefcase className="mr-2 h-5 w-5" />
          Gestión de Faenas */}
        </DialogTitle>
        {/* <DialogDescription>
          Configuración de faenas agrícolas
        </DialogDescription> */}
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <Faenas isModal={true} />
      </div>
    </>
  );


  const renderTaskView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <Labores isModal={true} />
      </div>
    </>
  );

  const renderProductCategoryView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <ProductCategory isModal={true} />
      </div>
    </>
  );

  const renderCostClassificationView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <CostClassification isModal={true} />
      </div>
    </>
  );

  const renderMeasurementUnitsView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <MeasurementUnits isModal={true} />
      </div>
    </>
  );

  const renderCropTypeView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <CropType isModal={true} />
      </div>
    </>
  );

  const renderVarietyTypeView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <VarietyType isModal={true} />
      </div>
    </>
  );

  const renderSoilTypeView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <SoilType isModal={true} />
      </div>
    </>
  );

  const renderTemperatureUnitView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <TemperatureUnit isModal={true} />
      </div>
    </>
  );

  const renderPressureUnitView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <PressureUnit isModal={true} />
      </div>
    </>
  );

  const renderWeatherConditionsView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <WeatherConditions isModal={true} />
      </div>
    </>
  );

  const renderWindConditionsView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <WindConditions isModal={true} />
      </div>
    </>
  );

  const renderMachineryBrandView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <MachineryBrand isModal={true} />
      </div>
    </>
  );

  const renderMachineryTypeView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <MachineryType isModal={true} />
      </div>
    </>
  );

  const renderMaritalStatusView = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <MaritalStatus isModal={true} />
      </div>
    </>
  );

  const renderGenericEnterpriseView = (title: string, entityType: string) => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Button variant="outline" size="default" onClick={handleBackToMain} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground">Funcionalidad para {entityType} en desarrollo...</p>
        </div>
      </div>
    </>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "faenas":
        return renderTasktypeView();
      case "labores":
        return renderTaskView();
      case "productCategory":
        return renderProductCategoryView();
      case "costClassification":
        return renderCostClassificationView();
      case "measurementUnits":
        return renderMeasurementUnitsView();
      case "cropType":
        return renderCropTypeView();
      case "varietyType":
        return renderVarietyTypeView();
      case "soilType":
        return renderSoilTypeView();
      case "temperatureUnit":
        return renderTemperatureUnitView();
      case "pressureUnit":
        return renderPressureUnitView();
      case "weatherConditions":
        return renderWeatherConditionsView();
      case "windConditions":
        return renderWindConditionsView();
      case "machineryBrand":
        return renderMachineryBrandView();
      case "machineryType":
        return renderMachineryTypeView();
      case "maritalStatus":
        return renderMaritalStatusView();
      case "wasteType":
        return renderGenericEnterpriseView("Tipos de Residuos", "tipos de residuos");
      case "usuarios":
        return renderGenericEnterpriseView("Gestión de Usuarios", "usuarios del sistema");
      default:
        return renderMainView();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        {renderCurrentView()}
      </DialogContent>
    </Dialog>
  );
};

export default GeneralConfigurationsModal;