"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type CategoryData = {
  name: string;
  value: number;
  color: string;
};

type CategoryChartProps = {
  data: CategoryData[];
  onClick?: () => void;
};

/**
 * Componente de gráfico circular (Donut) para mostrar distribución de emails por categoría
 * Usa los colores definidos en global.css para cada categoría
 */
export default function CategoryChart({ data, onClick }: CategoryChartProps) {
  // Colores para cada categoría (del global.css)
  const COLORS: Record<string, string> = {
    cliente: "#43596f", // --color-primary-800
    lead: "#065f46",    // --color-secondary-800
    interno: "#4d5557", // --color-neutral-800
    spam: "#a1353a",    // --color-danger-800
  };

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.value, 0);



// Renderizar labels con porcentajes en cada sección
  const renderCustomLabel = (entry: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = entry;
    const RADIAN = Math.PI / 180;
    // Posicionar en el medio exacto del ancho de la dona
    const radius = (innerRadius + outerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    const percentage = (percent * 100).toFixed(0);
    
    // Solo mostrar si el porcentaje es mayor a 5% para evitar texto apretado
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
        style={{ 
          pointerEvents: 'none',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        {`${percentage}%`}
      </text>
    );
  };

  // Renderizar label en el centro del donut (total)
  const renderCenterLabel = () => {
    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-2xl font-bold fill-[color:var(--color-text-primary)]"
      >
        {total}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <div className="bg-[color:var(--color-bg-card)] border border-[color:var(--color-border-light)] rounded-md p-2 shadow-lg">
          <p className="text-sm font-medium text-[color:var(--color-text-primary)]">
            {data.name}
          </p>
          <p className="text-xs text-[color:var(--color-text-secondary)]">
            {data.value} emails ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-[color:var(--color-text-secondary)]">
              {entry.value}: {entry.payload.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const content = (
    <div className="card-base p-6  h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[color:var(--color-text-primary)]">
          Emails por Categoría
        </h3>
        <p className="text-xs text-[color:var(--color-text-muted)] mt-1">
          Distribución de {total} emails entre categorías
        </p>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-sm text-[color:var(--color-text-muted)]">
              No hay datos de categorías disponibles
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={330}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name]} 
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left card-clickable"
        aria-label="Ver detalles de categorías"
      >
        {content}
      </button>
    );
  }

  return content;
}