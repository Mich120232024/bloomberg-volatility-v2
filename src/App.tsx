import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TabNavigation, TabId } from './components/TabNavigation';
import { VolatilitySurface } from './components/VolatilitySurface';
import { 
  checkBloombergConnection, 
  fetchVolatilitySurface, 
  currencyPairs,
  CurrencyPair,
  DataMode,
  VolatilityData 
} from './services/bloombergApi';
import './styles/global.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('volatility-surface');
  const [isConnected, setIsConnected] = useState(false);
  const [dataMode, setDataMode] = useState<DataMode>('Live');
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('EURUSD');
  const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check Bloomberg connection
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkBloombergConnection();
      setIsConnected(connected);
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);

  // Load volatility data
  const loadVolatilityData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchVolatilitySurface(selectedPair, dataMode);
      setVolatilityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load volatility data');
      setVolatilityData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPair, dataMode]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    if (activeTab === 'volatility-surface') {
      loadVolatilityData();
    }
  }, [activeTab, selectedPair, dataMode, loadVolatilityData]);

  const handleRefresh = () => {
    loadVolatilityData();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'volatility-surface':
        return (
          <>
            <div className="controls-section">
              <h2 className="controls-title">
                {selectedPair} Volatility Surface - Real-time Bloomberg Data
              </h2>
              
              <div className="controls-group">
                <div className="dropdown">
                  <select 
                    value={dataMode} 
                    onChange={(e) => setDataMode(e.target.value as DataMode)}
                  >
                    <option value="Live">Live</option>
                    <option value="Latest EOD">Latest EOD</option>
                    <option value="Historical">Historical</option>
                  </select>
                </div>
                
                <div className="dropdown">
                  <select 
                    value={selectedPair} 
                    onChange={(e) => setSelectedPair(e.target.value as CurrencyPair)}
                  >
                    {currencyPairs.map(pair => (
                      <option key={pair} value={pair}>{pair}</option>
                    ))}
                  </select>
                </div>
                
                <button className="button button-primary" onClick={handleRefresh}>
                  Refresh Now
                </button>
              </div>
            </div>
            
            <div className="surface-container">
              <VolatilitySurface 
                data={volatilityData}
                pair={selectedPair}
                loading={loading}
                error={error}
              />
            </div>
          </>
        );
      
      case 'historical-analysis':
        return (
          <div className="surface-container">
            <div className="no-data">
              <div className="no-data-title">Historical Analysis</div>
              <div className="no-data-message">Coming soon</div>
            </div>
          </div>
        );
      
      case 'volatility-analysis':
        return (
          <div className="surface-container">
            <div className="no-data">
              <div className="no-data-title">Volatility Analysis</div>
              <div className="no-data-message">Coming soon</div>
            </div>
          </div>
        );
      
      case 'yield-curves':
        return (
          <div className="surface-container">
            <div className="no-data">
              <div className="no-data-title">Yield Curves</div>
              <div className="no-data-message">Coming soon</div>
            </div>
          </div>
        );
      
      case 'fx-forwards':
        return (
          <div className="surface-container">
            <div className="no-data">
              <div className="no-data-title">FX Forwards</div>
              <div className="no-data-message">Coming soon</div>
            </div>
          </div>
        );
      
      case 'option-pricing':
        return (
          <div className="surface-container">
            <div className="no-data">
              <div className="no-data-title">Option Pricing</div>
              <div className="no-data-message">Coming soon</div>
            </div>
          </div>
        );
      
      case 'portfolio':
        return (
          <div className="surface-container">
            <div className="no-data">
              <div className="no-data-title">Portfolio</div>
              <div className="no-data-message">Coming soon</div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div id="root">
      <Header 
        isConnected={isConnected}
        apiEndpoint={isConnected ? 'bloomberg-gateway' : 'nginx-proxy'}
      />
      
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App
