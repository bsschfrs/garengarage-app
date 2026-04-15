import { useState } from "react";
import CommunityInspirations from "@/components/community/CommunityInspirations";
import CommunityQuestions from "@/components/community/CommunityQuestions";
import CommunityCreations from "@/components/community/CommunityCreations";

const tabs = [
  { id: "inspiratie", label: "Inspiratie" },
  { id: "vragen", label: "Vragen" },
  { id: "ontwerpen", label: "Ontwerpen" },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("inspiratie");

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-lg font-semibold">Community</h1>

      <div className="flex gap-1 rounded-xl bg-secondary p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "inspiratie" && <CommunityInspirations />}
      {activeTab === "vragen" && <CommunityQuestions />}
      {activeTab === "ontwerpen" && <CommunityCreations />}
    </div>
  );
}
