import React from 'react';
import gzcLogo from '../assets/gzc-logo.svg';

interface HeaderProps {
  isConnected: boolean;
  apiEndpoint: string;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, apiEndpoint }) => {
  return (
    <header className="header">
      <div className="header-left">
        <img src={gzcLogo} alt="GZC" className="header-logo" />
        <h1 className="header-title">
          Bloomberg Volatility Surface
          <span className="header-subtitle">Real-time FX Option Volatilities</span>
        </h1>
      </div>
      
      <div className="status-container">
        <div className="status-indicator">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            Bloomberg {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="api-info">API: {apiEndpoint}</div>
      </div>
    </header>
  );
};