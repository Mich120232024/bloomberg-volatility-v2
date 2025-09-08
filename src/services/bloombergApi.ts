import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BLOOMBERG_API_URL || 'https://bloomberg-gateway.internal.delightfulground-653e61be.eastus.azurecontainerapps.io/api';

export interface VolatilityData {
  deltas: number[];
  tenors: string[];
  matrix: number[][];
}

export const currencyPairs = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
  'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
  'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD',
  'AUDJPY', 'CADJPY', 'NZDJPY', 'CHFJPY',
  'AUDCAD', 'AUDCHF', 'AUDNZD', 'CADCHF', 'NZDCAD', 'NZDCHF'
] as const;

export type CurrencyPair = typeof currencyPairs[number];
export type DataMode = 'Live' | 'Latest EOD' | 'Historical';

const tenorMapping: Record<string, string> = {
  'ON': 'VON',
  '1W': 'V1W',
  '2W': 'V2W',
  '3W': 'V3W',
  '1M': 'V1M',
  '2M': 'V2M',
  '3M': 'V3M',
  '4M': 'V4M',
  '6M': 'V6M',
  '9M': 'V9M',
  '1Y': 'V1Y',
  '18M': 'V18M',
  '2Y': 'V2Y'
};

const deltaValues = [50, 40, 30, 25, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25, -30, -40, -50];
const tenorLabels = ['ON', '1W', '2W', '3W', '1M', '2M', '3M', '4M', '6M', '9M', '1Y', '18M', '2Y'];

function buildSecurities(pair: string, tenors: string[]): string[] {
  const securities: string[] = [];
  
  for (const tenor of tenors) {
    // ATM volatility
    securities.push(`${pair}${tenorMapping[tenor]} Curncy`);
    
    // Risk reversals and butterflies for different deltas
    for (const delta of [5, 10, 15, 20, 25, 30, 40, 50]) {
      securities.push(`${pair}${delta}R${tenor} BGN Curncy`); // Risk reversal
      securities.push(`${pair}${delta}B${tenor} BGN Curncy`); // Butterfly
    }
  }
  
  return securities;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function generateMockData(_pair: string): VolatilityData {
  // Generate realistic mock volatility surface data
  const baseVol = 8 + Math.random() * 4; // Base volatility between 8-12%
  const matrix: number[][] = [];
  
  for (let i = 0; i < tenorLabels.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < deltaValues.length; j++) {
      // Create smile effect (higher vol for OTM options)
      const deltaEffect = Math.abs(deltaValues[j]) * 0.02;
      // Term structure (higher vol for longer tenors)
      const tenorEffect = i * 0.1;
      // Add some randomness
      const noise = (Math.random() - 0.5) * 0.5;
      
      const vol = baseVol + deltaEffect + tenorEffect + noise;
      row.push(Math.max(5, Math.min(20, vol))); // Clamp between 5-20%
    }
    matrix.push(row);
  }
  
  return {
    deltas: deltaValues,
    tenors: tenorLabels,
    matrix
  };
}

export async function checkBloombergConnection(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

export async function fetchVolatilitySurface(
  pair: CurrencyPair,
  _mode: DataMode = 'Live'
): Promise<VolatilityData> {
  try {
    // For development/demo, return mock data
    if (import.meta.env.DEV || !API_BASE_URL.includes('bloomberg')) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return generateMockData(pair);
    }
    
    const securities = buildSecurities(pair, tenorLabels);
    const chunks = chunkArray(securities, 50); // Bloomberg API limit
    
    await Promise.all(
      chunks.map(chunk =>
        axios.post(`${API_BASE_URL}/bloomberg/reference`, {
          securities: chunk,
          fields: ['PX_LAST', 'PX_BID', 'PX_ASK']
        })
      )
    );
    
    // Process responses and build matrix
    // This would require parsing the Bloomberg response format
    // For now, return mock data
    return generateMockData(pair);
    
  } catch (error) {
    console.error('Failed to fetch volatility surface:', error);
    // Return mock data as fallback
    return generateMockData(pair);
  }
}