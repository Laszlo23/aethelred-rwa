import type { AssetPropertyDTO } from "@/lib/types";
import { formatPercent, formatPropertyClass } from "@/lib/format";

interface PropertySpecsProps {
  property: AssetPropertyDTO;
}

export function PropertySpecs({ property }: PropertySpecsProps) {
  const specs = [
    property.sqm != null && { label: "Area", value: `${property.sqm.toLocaleString()} m²` },
    property.units != null && { label: "Units", value: String(property.units) },
    property.beds != null && { label: "Beds", value: String(property.beds) },
    property.yearBuilt != null && { label: "Built", value: String(property.yearBuilt) },
    property.occupancyBps != null && {
      label: "Occupancy",
      value: formatPercent(property.occupancyBps),
    },
    { label: "Class", value: formatPropertyClass(property.propertyClass) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {specs.map((spec) => (
        <div key={spec.label} className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="eyebrow !text-[9px]">{spec.label}</p>
          <p className="mt-1 text-sm font-medium">{spec.value}</p>
        </div>
      ))}
    </div>
  );
}
