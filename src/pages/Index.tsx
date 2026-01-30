import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { ClientsTable } from "@/components/ClientsTable";
import { ScriptEditor } from "@/components/ScriptEditor";
import { ScriptFlowEditor } from "@/components/ScriptFlowEditor";
import { ObjectionsLibrary } from "@/components/ObjectionsLibrary";
import { AIAgent } from "@/components/AIAgent";
import { CampaignsPage } from "@/components/CampaignsPage";
import { SheetsIntegration } from "@/components/SheetsIntegration";
import { SettingsPage } from "@/components/SettingsPage";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientsTable />;
      case 'campaigns':
        return <CampaignsPage />;
      case 'scripts':
        return <ScriptEditor />;
      case 'script-editor':
        return <ScriptFlowEditor />;
      case 'objections':
        return <ObjectionsLibrary />;
      case 'ai-agent':
        return <AIAgent />;
      case 'sheets':
        return <SheetsIntegration />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="gradient-glow absolute top-0 left-64 right-0 h-96 pointer-events-none" />
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
