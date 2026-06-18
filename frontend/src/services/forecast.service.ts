import api from '../lib/api/client';

export interface ForecastDealRow {
  id: string;
  name: string;
  ownerId: string | null;
  ownerName: string;
  stageId: string;
  stageName: string;
  value: number;
  probability: number;
  forecastedValue: number;
  expectedCloseDate: string | null;
  currency: string;
}

export interface ForecastSummary {
  totalPipeline: number;
  totalForecast: number;
  dealCount: number;
  onTrackCount: number;
  atRiskCount: number;
  currency: string;
  deals: ForecastDealRow[];
}

export const forecastService = {
  getForecast: (pipelineId?: string) =>
    api.get<{ data: ForecastSummary }>('/crm/forecast', { params: { pipelineId } }),
  getByStage: (pipelineId?: string) =>
    api.get('/crm/forecast/by-stage', { params: { pipelineId } }),
  getByOwner: (pipelineId?: string) =>
    api.get('/crm/forecast/by-owner', { params: { pipelineId } }),
  getHistorical: () => api.get('/crm/forecast/historical'),
};
