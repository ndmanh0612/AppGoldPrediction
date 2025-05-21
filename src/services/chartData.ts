
import moment from "moment";

export interface DataPoint {
  x: number;
  y: number;
}

/**
 * Load and parse historical gold price data from JSON asset
 */
export function getHistoricalData(): DataPoint[] {
  const raw: any[] = require("../../assets/data/output.json");
  const data = raw
    .map(item => ({
      x: moment(item.Date, "MM/DD/YYYY").valueOf(),
      y: parseFloat(item.Price.replace(/,/g, "")),
    }))
    .reverse();
  return data;
}

/**
 * Load and parse forecast prediction data from JSON asset
 */
export function getForecastData(): DataPoint[] {
  const raw: any[] = require("../../assets/data/Prediction2025.json");
  return raw.map(item => ({
    x: moment(item.datetime, "YYYY-MM-DD").valueOf(),
    y: item.predicted_demand,
  }));
}

/**
 * Combine historical and forecast data
 */
export function getAllChartData(): DataPoint[] {
  return [...getHistoricalData(), ...getForecastData()];
}

/**
 * Compute bounds and ticks for chart axes
 */
export function getChartBounds() {
  const all = getAllChartData();
  const xMin = all[0].x;
  const xMax = all[all.length - 1].x;
  const yValues = all.map(p => p.y);
  const yMin = Math.min(...yValues) * 0.95;
  const yMax = Math.max(...yValues) * 1.05;
  const numberOfTicks = new Date().getFullYear() - 2013 + 1;
  return { xMin, xMax, yMin, yMax, numberOfTicks };
}
