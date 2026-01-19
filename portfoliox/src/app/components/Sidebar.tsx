import { useState } from "react";
import { Tab } from "../page";

type SidebarProps = {
  onOpenTab: (tab: Tab) => void;
};

export default function Sidebar({ onOpenTab }: SidebarProps) {
  const items = [
    {
      name: "All",
      file: "all.js",
      content: "// All projects collection",
      icon: "📂",
      type: "folder",
    },
    {
      name: "Projects",
      file: "projects.tsx",
      content: "// Selected projects showcase",
      icon: "📦",
      type: "folder",
      items: [
        {
          name: "Perlin Mountains",
          file: "perlinMountains.tsx",
          type: "component",
          component: "PerlinMountains",
          icon: "🎨",
        },
        {
          name: "Drappy",
          file: "Drappy.js",
          type: "component",
          component: "Drappyu",
          icon: "🎨",
        },
        {
          name: "Black Fridge",
          file: "black-fridge.md",
          content: "DYE YOUR CLOTHES.\nSAVE THE PLANET.",
        },
        {
          name: "Task Part",
          file: "task-part.md",
          content: "Project details...",
        },
      ],
    },
    {
      name: "Experience",
      file: "experience.json",
      content: '{ "roles": [...] }',
      icon: "💼",
      type: "folder",
    },
    {
      name: "Education",
      file: "edu.yml",
      content: "- Degree in CS",
      icon: "🎓",
      type: "folder",
    },
    {
      name: "About",
      file: "about.md",
      content: "# creative technologist &\n# front-end engineer",
      icon: "📄",
    },
    {
      name: "Contact",
      file: "contact.sh",
      content: '#!/bin/bash\nsend-mail "Hi!"',
      icon: "📧",
    },
  ];

  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);

  const handleItemClick = (item: any) => {
    if (item.type === "component") {
      onOpenTab({
        fileName: item.file,
        type: "component",
        component: item.component,
      });
    } else {
      onOpenTab({
        fileName: item.file,
        content: item.content,
      });
    }
  };

  return (
    <div className="flex h-full font-mono text-sm">
      {/* Activity Bar (Icons only) */}
      {/* <div className="w-12 bg-[#252526] flex flex-col items-center py-4 gap-2 border-r border-[#333333]">
        {items.filter(item => item.type === 'folder').map(item => (
          <button
            key={item.file}
            className="w-12 h-12 flex items-center justify-center text-xl hover:bg-[#2a2d2e] transition-colors duration-200 group relative"
            onClick={() => onOpenTab({
              fileName: item.file,
              content: item.content
            })}
          >
            <span className="text-[#858585] group-hover:text-white">{item.icon}</span>
            <span className="absolute left-12 bg-[#252526] px-2 py-1 rounded text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
              {item.name}
            </span>
          </button>
        ))}
      </div> */}

      {/* Explorer Panel */}
      <div className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-[#333333]">
          <h1 className="text-[#CCCCCC] font-semibold text-xs tracking-wider">
            EXPLORER
          </h1>
        </div>

        <nav className="p-2 space-y-1">
          {items.map((item) => (
            <div key={item.file}>
              <button
                className="flex items-center w-full text-left py-1.5 px-2 hover:bg-[#2a2d2e] rounded-md text-[#CCCCCC] hover:text-white transition-colors duration-200 group"
                onClick={() => handleItemClick(item)}
              >
                <span className="mr-2 text-[#858585]">{item.icon}</span>
                <span>{item.name}</span>
                {item.items && (
                  <span className="ml-auto text-[#858585] text-xs">{"▶"}</span>
                )}
              </button>

              {/* Nested items */}
              {item.items?.map((nested) => (
                <button
                  key={nested.file}
                  className="flex items-center w-full text-left py-1 pl-8 pr-2 hover:bg-[#2a2d2e] rounded-md text-[#858585] hover:text-white transition-colors duration-200"
                  onClick={() => handleItemClick(nested)}
                >
                  <span className="mr-2">{nested.icon || "📄"}</span>
                  {nested.name}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
