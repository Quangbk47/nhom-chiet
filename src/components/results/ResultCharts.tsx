import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { SimulationResult } from '../../domain/models';
import { chartDefinitions, formatResultValue } from '../../presentation/resultPresentation';

export function ResultCharts({ result }: { readonly result: SimulationResult }) {
  return (
    <div className="charts-grid">
      {chartDefinitions(result.charts).map((chart) => (
        <figure key={chart.id} className="chart-card" aria-labelledby={`${chart.id}-title`}>
          <h3 id={`${chart.id}-title`}>{chart.title}</h3>
          <p className="chart-unit">Trục X: Stage · Trục Y: {chart.unit}</p>
          <div className="chart-canvas" data-testid={`chart-${chart.id}`}>
            <ResponsiveContainer width="100%" height="100%">
              {chart.kind === 'line' ? (
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis
                    dataKey="stageNumber"
                    label={{ value: 'Stage', position: 'insideBottom', offset: -2 }}
                  />
                  <YAxis width={70} />
                  <Tooltip
                    formatter={(value) => [
                      `${formatResultValue(Number(value))} ${chart.unit}`,
                      chart.title,
                    ]}
                  />
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke={chart.color}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              ) : (
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis
                    dataKey="stageNumber"
                    label={{ value: 'Stage', position: 'insideBottom', offset: -2 }}
                  />
                  <YAxis width={70} />
                  <Tooltip
                    formatter={(value) => [
                      `${formatResultValue(Number(value))} ${chart.unit}`,
                      chart.title,
                    ]}
                  />
                  <Bar dataKey="value" fill={chart.color} isAnimationActive={false} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
          <table className="chart-alternative">
            <caption>Dữ liệu thay thế — {chart.title}</caption>
            <thead>
              <tr>
                <th scope="col">Stage</th>
                <th scope="col">Giá trị ({chart.unit})</th>
              </tr>
            </thead>
            <tbody>
              {chart.data.map((point) => (
                <tr key={point.stageNumber}>
                  <th scope="row">{point.stageNumber}</th>
                  <td>{formatResultValue(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="chart-provenance">
            Nguồn: SimulationResult {result.schemaVersion}, engine {result.engineVersion}; KD{' '}
            {result.provenance.kd.sourceType}; {result.provenance.temperature.valueC} °C (
            {result.provenance.temperature.status}).
          </p>
        </figure>
      ))}
    </div>
  );
}
