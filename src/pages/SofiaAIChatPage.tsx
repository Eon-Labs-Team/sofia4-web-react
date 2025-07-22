import React from 'react';
import { SofiaAIChat } from '@/components/SofiaAIChat';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Brain, Database, TrendingUp } from "lucide-react";

const SofiaAIChatPage = () => {
  const [isChatOpen, setIsChatOpen] = React.useState(true);

  const features = [
    {
      icon: <Database className="h-8 w-8 text-green-600" />,
      title: "Análisis de Órdenes",
      description: "Consulta y analiza todas las órdenes de aplicación de productos fitosanitarios"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-600" />,
      title: "Tendencias y Métricas",
      description: "Visualiza tendencias de aplicación, eficiencia por hectárea y rendimiento"
    },
    {
      icon: <Brain className="h-8 w-8 text-green-600" />,
      title: "IA Inteligente",
      description: "Obtén insights automáticos y recomendaciones basadas en tus datos"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-10 w-10 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Sofia AI - Asistente Inteligente</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Tu asistente de IA especializado en análisis de órdenes de aplicación de productos fitosanitarios. 
          Consulta datos, obtén insights y visualiza tendencias de manera inteligente.
        </p>
      </div>

      {/* Características */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {features.map((feature, index) => (
          <Card key={index} className="border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ejemplos de consultas */}
      <Card className="mb-8 border-green-200">
        <CardHeader>
          <CardTitle className="text-xl text-green-800">Ejemplos de Consultas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Consultas por Producto</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Mostrar órdenes que usaron insecticida en enero"</li>
                <li>• "Productos más aplicados en el cuartel A"</li>
                <li>• "Eficiencia de aplicación por tipo de producto"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Análisis Temporales</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• "Tendencias de aplicación por mes"</li>
                <li>• "Órdenes completadas vs pendientes"</li>
                <li>• "Rendimiento por hectárea por período"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <SofiaAIChat 
        open={isChatOpen} 
        onOpenChange={setIsChatOpen} 
      />
    </div>
  );
};

export default SofiaAIChatPage; 