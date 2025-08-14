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
import { Settings, Briefcase, Building2, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Faenas from "@/pages/Faenas";
import Labores from "@/pages/Labores";

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
      id: "general-settings",
      title: "Configuraciones Generales",
      description: "Configuraciones del sistema que aplican globalmente",
      items: [
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="task-management">Gestión de Tareas</TabsTrigger>
            <TabsTrigger value="general-settings">Configuraciones</TabsTrigger>
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
          {/* <Building2 className="mr-2 h-5 w-5" />
          Gestión de Labores */}
        </DialogTitle>
        {/* <DialogDescription>
          Configuración de labores asociadas a las faenas
        </DialogDescription> */}
      </DialogHeader>

      <div className="flex-1 overflow-hidden">
        <Labores isModal={true} />
      </div>
    </>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "faenas":
        return renderTasktypeView();
      case "labores":
        return renderTaskView();
      case "usuarios":
        return (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Button variant="ghost" size="sm" onClick={handleBackToMain} className="mr-2">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
                <Users className="mr-2 h-5 w-5" />
                Gestión de Usuarios
              </DialogTitle>
              <DialogDescription>
                Configuración de usuarios del sistema
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden p-4">
              <p className="text-muted-foreground">Funcionalidad de usuarios en desarrollo...</p>
            </div>
          </>
        );
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