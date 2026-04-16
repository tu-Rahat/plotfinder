function formatNumber(value) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

function ResourceEstimateCard({ buildingWidth = 0, buildingDepth = 0, floors = 1 }) {
  const safeWidth = Math.max(Number(buildingWidth || 0), 0);
  const safeDepth = Math.max(Number(buildingDepth || 0), 0);
  const safeFloors = Math.max(Number(floors || 1), 1);

  const footprintArea = safeWidth * safeDepth;
  const builtUpArea = footprintArea * safeFloors;

  // Rough planning assumptions per sqft of built-up area
  const BRICKS_PER_SQFT = 55;
  const CEMENT_BAGS_PER_SQFT = 0.5;
  const STEEL_KG_PER_SQFT = 3.75;
  const SAND_CFT_PER_SQFT = 1.5;
  const PAINT_AREA_FACTOR = 2.8;

  // Rough construction cost range per sqft
  const MIN_COST_PER_SQFT = 2500;
  const MAX_COST_PER_SQFT = 4000;

  const estimatedBricks = builtUpArea * BRICKS_PER_SQFT;
  const estimatedCementBags = builtUpArea * CEMENT_BAGS_PER_SQFT;
  const estimatedSteelKg = builtUpArea * STEEL_KG_PER_SQFT;
  const estimatedSteelTons = estimatedSteelKg / 1000;
  const estimatedSandCft = builtUpArea * SAND_CFT_PER_SQFT;
  const estimatedPaintArea = builtUpArea * PAINT_AREA_FACTOR;

  const minEstimatedCost = builtUpArea * MIN_COST_PER_SQFT;
  const maxEstimatedCost = builtUpArea * MAX_COST_PER_SQFT;

  return (
    <div className="resource-estimate-card">
      <div className="resource-estimate-header">
        <div>
          <h3>Construction Resource Estimate</h3>
          <p>
            Rough planning estimate based on the current building preview dimensions.
          </p>
        </div>
      </div>

      <div className="resource-estimate-grid">
        <div className="resource-estimate-item">
          <span>Footprint Area</span>
          <strong>{formatNumber(footprintArea)} sqft</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Total Built-up Area</span>
          <strong>{formatNumber(builtUpArea)} sqft</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Estimated Bricks</span>
          <strong>~{formatNumber(estimatedBricks)}</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Estimated Cement</span>
          <strong>~{formatNumber(estimatedCementBags)} bags</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Estimated Steel</span>
          <strong>~{estimatedSteelTons.toFixed(2)} tons</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Estimated Sand</span>
          <strong>~{formatNumber(estimatedSandCft)} cft</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Estimated Paint Area</span>
          <strong>~{formatNumber(estimatedPaintArea)} sqft</strong>
        </div>

        <div className="resource-estimate-item">
          <span>Estimated Cost Range</span>
          <strong>
            ৳ {formatNumber(minEstimatedCost)} - ৳ {formatNumber(maxEstimatedCost)}
          </strong>
        </div>
      </div>

      <p className="resource-estimate-note">
        This is an approximate planning estimate only. Actual engineering quantities
        and cost depend on structure design, materials, labor, soil condition, and market rates.
      </p>
    </div>
  );
}

export default ResourceEstimateCard;