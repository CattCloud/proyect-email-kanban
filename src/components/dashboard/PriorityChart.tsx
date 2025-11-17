"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type PriorityData = {
  name: string;
  value: number;
  fill: string;
};

type PriorityChartProps = {
  data: PriorityData[];
  onClick?: () => void;
};

/**
 * Componente de gráfico de barras para mostrar distribución de emails por prioridad
 * Usa los colores definidos en global.css para cada prioridad
 */
export default function PriorityChart({ data, onClick }: PriorityChartProps) {
  // Calcular total
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-[color:var(--color-bg-card)] border border-[color:var(--color-border-light)] rounded-md p-2 shadow-lg">
          <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
            Prioridad {data.payload.name}
          </p>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            {data.value} emails ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label para mostrar valores encima de las barras
  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="var(--color-text-primary)"
        textAnchor="middle"
        className="text-xs font-semibold"
      >
        {value}
      </text>
    );
  };

  const content = (
    <div className="card-base p-6  h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
          Emails por Prioridad
        </h3>
        <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
          Distribución de {total} emails entre prioridades
        </p>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-[color:var(--color-text-muted)]">
              No hay datos de prioridades disponibles
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-text-muted)"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border-default)' }}
            />
            <YAxis 
              stroke="var(--color-text-muted)"
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border-default)' }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-bg-hover)' }} />
            <Bar 
              dataKey="value" 
              radius={[8, 8, 0, 0]}
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Leyenda manual */}
      {total > 0 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-xs text-[color:var(--color-text-secondary)]">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left card-clickable"
        aria-label="Ver detalles de prioridades"
      >
        {content}
      </button>
    );
  }

  return content;
}