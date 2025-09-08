import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { Data, Layout, Config } from 'plotly.js';

interface VolatilitySurfaceProps {
  data: {
    deltas: number[];
    tenors: string[];
    matrix: number[][];
  } | null;
  pair: string;
  loading?: boolean;
  error?: string | null;
}

export const VolatilitySurface: React.FC<VolatilitySurfaceProps> = ({ 
  data, 
  pair, 
  loading, 
  error 
}) => {
  const plotData = useMemo<Data[]>(() => {
    if (!data) return [];
    
    return [{
      type: 'surface' as const,
      x: data.deltas,
      y: data.tenors,
      z: data.matrix,
      colorscale: [
        [0, '#1a1a1a'],      // Deep carbon black (low vol)
        [0.25, '#2d4a3a'],   // Dark forest green  
        [0.5, '#7A9E65'],    // GZC theme primary green
        [0.75, '#a8c98a'],   // Clean light green
        [1, '#d4e7c5']       // Very light green (high vol)
      ],
      showscale: true,
      colorbar: {
        title: {
          text: 'Implied Vol (%)',
          side: 'right'
        },
        thickness: 20,
        len: 0.7,
        bgcolor: 'rgba(0,0,0,0)',
        bordercolor: '#2d2d2d',
        borderwidth: 1,
        tickfont: {
          color: '#a0a0a0',
          size: 11
        }
      },
      hovertemplate: 
        '<b>Delta:</b> %{x}<br>' +
        '<b>Tenor:</b> %{y}<br>' +
        '<b>Vol:</b> %{z:.2f}%<br>' +
        '<extra></extra>',
      lighting: {
        ambient: 0.7,
        diffuse: 0.9,
        specular: 0.05,
        roughness: 0.3,
        fresnel: 0.2
      },
      lightposition: {
        x: 100,
        y: 100,
        z: 100
      }
    }];
  }, [data]);

  const layout = useMemo<Partial<Layout>>(() => ({
    scene: {
      xaxis: {
        title: {
          text: 'Delta',
          font: { color: '#a0a0a0', size: 12 }
        },
        gridcolor: '#2d2d2d',
        linecolor: '#2d2d2d',
        tickfont: { color: '#a0a0a0', size: 10 },
        showspikes: false
      },
      yaxis: {
        title: {
          text: 'Tenor',
          font: { color: '#a0a0a0', size: 12 }
        },
        gridcolor: '#2d2d2d',
        linecolor: '#2d2d2d',
        tickfont: { color: '#a0a0a0', size: 10 },
        showspikes: false
      },
      zaxis: {
        title: {
          text: 'Implied Volatility (%)',
          font: { color: '#a0a0a0', size: 12 }
        },
        gridcolor: '#2d2d2d',
        linecolor: '#2d2d2d',
        tickfont: { color: '#a0a0a0', size: 10 },
        showspikes: false
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 },
        center: { x: 0, y: 0, z: 0 }
      },
      aspectmode: 'manual',
      aspectratio: { x: 1, y: 1, z: 0.7 },
      bgcolor: 'transparent'
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    margin: { l: 0, r: 0, b: 0, t: 0 },
    autosize: true,
    showlegend: false,
    hoverlabel: {
      bgcolor: '#1a1a1a',
      bordercolor: '#2d2d2d',
      font: { color: '#ffffff', size: 12 }
    }
  }), []);

  const config = useMemo<Partial<Config>>(() => ({
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'editInChartStudio', 'select2d', 'lasso2d'],
    modeBarButtons: [
      ['zoom3d', 'pan3d', 'orbitRotation', 'tableRotation', 'resetCameraDefault3d']
    ],
    toImageButtonOptions: {
      format: 'png',
      filename: `${pair}_volatility_surface`,
      height: 600,
      width: 800,
      scale: 1
    },
    responsive: true
  }), [pair]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-text">
          <strong>Error:</strong>{error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="no-data">
        <div className="no-data-title">No Data Available</div>
        <div className="no-data-message">
          Bloomberg returned no volatility data for this currency pair
        </div>
      </div>
    );
  }

  return (
    <div className="plotly-container">
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};