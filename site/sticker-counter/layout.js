export const VINYL_WIDTH_MM = 480;
export const OVERVIEW_MAX_LENGTH_MM = 2000;

function validDimension(value) {
  return Number.isFinite(value) && value > 0;
}

export function calculateGrid({itemWidth, itemHeight, gap, length}) {
  if (!validDimension(itemWidth) || !validDimension(itemHeight) || !validDimension(length) || !Number.isFinite(gap) || gap < 0) {
    return {columns: 0, rows: 0, total: 0, usedWidth: 0, usedLength: 0};
  }

  const columns = itemWidth > VINYL_WIDTH_MM ? 0 : Math.floor((VINYL_WIDTH_MM + gap) / (itemWidth + gap));
  const rows = itemHeight > length ? 0 : Math.floor((length + gap) / (itemHeight + gap));
  const total = columns * rows;

  if (!total) return {columns: 0, rows: 0, total: 0, usedWidth: 0, usedLength: 0};

  return {
    columns,
    rows,
    total,
    usedWidth: columns ? columns * itemWidth + (columns - 1) * gap : 0,
    usedLength: rows ? rows * itemHeight + (rows - 1) * gap : 0,
  };
}
