export const VINYL_WIDTH_MM = 480;
export const OVERVIEW_MAX_LENGTH_MM = 2000;

function validDimension(value) {
  return Number.isFinite(value) && value > 0;
}

export function calculateGrid({vinylWidth = VINYL_WIDTH_MM, itemWidth, itemHeight, gap, length}) {
  if (!validDimension(vinylWidth) || !validDimension(itemWidth) || !validDimension(itemHeight) || !validDimension(length) || !Number.isFinite(gap) || gap < 0) {
    return {columns: 0, rows: 0, total: 0, usedWidth: 0, usedLength: 0};
  }

  const columns = itemWidth > vinylWidth ? 0 : Math.floor((vinylWidth + gap) / (itemWidth + gap));
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

export function gridItemPosition({column, row, itemWidth, itemHeight, gap}) {
  return {
    left: column * (itemWidth + gap),
    top: row * (itemHeight + gap),
    width: itemWidth,
    height: itemHeight,
  };
}

export function overviewItemPositions({columns, rows, itemWidth, itemHeight, gap, overviewLength}) {
  const visibleRows = Math.min(rows, Math.floor((overviewLength + gap) / (itemHeight + gap)));
  const positions = [];

  for (let row = 0; row < visibleRows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      positions.push(gridItemPosition({column, row, itemWidth, itemHeight, gap}));
    }
  }

  return positions;
}

export function previewFrame(position, {vinylWidth, overviewLength}) {
  return {
    left: position.left / vinylWidth * 100,
    top: position.top / overviewLength * 100,
    width: position.width / vinylWidth * 100,
    height: position.height / overviewLength * 100,
  };
}

export function previewSheetRatio({vinylWidth, overviewLength}) {
  return vinylWidth / overviewLength;
}
