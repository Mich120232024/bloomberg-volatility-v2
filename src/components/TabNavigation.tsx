import React from 'react';

export type TabId = 
  | 'volatility-surface' 
  | 'historical-analysis' 
  | 'volatility-analysis'
  | 'yield-curves'
  | 'fx-forwards'
  | 'option-pricing'
  | 'portfolio';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'volatility-surface', label: 'Volatility Surface' },
  { id: 'historical-analysis', label: 'Historical Analysis' },
  { id: 'volatility-analysis', label: 'Volatility Analysis' },
  { id: 'yield-curves', label: 'Yield Curves' },
  { id: 'fx-forwards', label: 'FX Forwards' },
  { id: 'option-pricing', label: 'Option Pricing' },
  { id: 'portfolio', label: 'Portfolio' },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};