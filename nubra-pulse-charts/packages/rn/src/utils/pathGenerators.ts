export type LinePoint = {
  x: number;
  y: number;
};

export type LineGenerator<T> = {
  x(
    accessor?: (d: T, i: number) => number
  ): ((d: T, i: number) => number) | LineGenerator<T>;
  y(
    accessor?: (d: T, i: number) => number
  ): ((d: T, i: number) => number) | LineGenerator<T>;
  defined(
    fn?: (d: T, i: number) => boolean
  ): ((d: T, i: number) => boolean) | undefined | LineGenerator<T>;
  curve(
    fn?: (points: LinePoint[]) => LinePoint[]
  ): ((points: LinePoint[]) => LinePoint[]) | undefined | LineGenerator<T>;
  (data: T[]): string | null;
};

export function line<T = LinePoint>(): LineGenerator<T> {
  let xAccessor: (d: T, i: number) => number = (d: any) => (d as LinePoint).x;
  let yAccessor: (d: T, i: number) => number = (d: any) => (d as LinePoint).y;
  let defined: ((d: T, i: number) => boolean) | undefined;
  let curveFn: ((points: LinePoint[]) => LinePoint[]) | undefined;

  const generator = function (data: T[]): string | null {
    if (!data || data.length === 0) return null;

    const points: LinePoint[] = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (defined && !defined(d, i)) continue;
      const x = xAccessor(d, i);
      const y = yAccessor(d, i);
      if (isNaN(x) || isNaN(y)) continue;
      points.push({ x, y });
    }

    if (points.length === 0) return null;

    const processedPoints = curveFn ? curveFn(points) : points;
    if (processedPoints.length === 0) return null;

    let path = `M${processedPoints[0].x},${processedPoints[0].y}`;
    for (let i = 1; i < processedPoints.length; i++) {
      path += `L${processedPoints[i].x},${processedPoints[i].y}`;
    }

    return path;
  } as LineGenerator<T>;

  generator.x = function (accessor?: (d: T, i: number) => number): ((d: T, i: number) => number) | LineGenerator<T> {
    if (accessor === undefined) return xAccessor;
    xAccessor = accessor;
    return generator;
  };

  generator.y = function (accessor?: (d: T, i: number) => number): ((d: T, i: number) => number) | LineGenerator<T> {
    if (accessor === undefined) return yAccessor;
    yAccessor = accessor;
    return generator;
  };

  generator.defined = function (fn?: (d: T, i: number) => boolean): ((d: T, i: number) => boolean) | undefined | LineGenerator<T> {
    if (fn === undefined) return defined;
    defined = fn;
    return generator;
  };

  generator.curve = function (fn?: (points: LinePoint[]) => LinePoint[]): ((points: LinePoint[]) => LinePoint[]) | undefined | LineGenerator<T> {
    if (fn === undefined) return curveFn;
    curveFn = fn;
    return generator;
  };

  return generator;
}

export function curveMonotoneX(points: LinePoint[]): LinePoint[] {
  if (points.length <= 2) return points;

  const n = points.length;
  const result: LinePoint[] = [points[0]];

  for (let i = 0; i < n - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < n - 2 ? points[i + 2] : points[i + 1];

    const t0 = 0;
    const t1 = 1;
    const t2 = 2;
    const t3 = 3;

    const m1x = ((p2.x - p0.x) / (t2 - t0)) * (t1 - t0);
    const m1y = ((p2.y - p0.y) / (t2 - t0)) * (t1 - t0);
    const m2x = ((p3.x - p1.x) / (t3 - t1)) * (t2 - t1);
    const m2y = ((p3.y - p1.y) / (t3 - t1)) * (t2 - t1);

    // Generate smooth curve segments
    const segments = 8;
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        (2 * t3 - 3 * t2 + 1) * p1.x +
        (t3 - 2 * t2 + t) * m1x +
        (-2 * t3 + 3 * t2) * p2.x +
        (t3 - t2) * m2x;

      const y =
        (2 * t3 - 3 * t2 + 1) * p1.y +
        (t3 - 2 * t2 + t) * m1y +
        (-2 * t3 + 3 * t2) * p2.y +
        (t3 - t2) * m2y;

      result.push({ x, y });
    }
  }

  result.push(points[n - 1]);
  return result;
}

export type ArcDatum = {
  startAngle: number;
  endAngle: number;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
};

export type ArcGenerator<T extends ArcDatum> = {
  innerRadius: (radius: number) => ArcGenerator<T>;
  outerRadius: (radius: number) => ArcGenerator<T>;
  startAngle: (accessor: (d: T) => number) => ArcGenerator<T>;
  endAngle: (accessor: (d: T) => number) => ArcGenerator<T>;
  padAngle: (angle: number) => ArcGenerator<T>;
  (datum: T): string | null;
  centroid(datum: T): [number, number];
};

export function arc<T extends ArcDatum = ArcDatum>(): ArcGenerator<T> {
  let innerRadius = 0;
  let outerRadius = 1;
  let startAngleAccessor: (d: T) => number = (d: T) => d.startAngle;
  let endAngleAccessor: (d: T) => number = (d: T) => d.endAngle;
  let padAngle = 0;

  const generator = function (datum: T): string | null {
    const startAngle = startAngleAccessor(datum);
    const endAngle = endAngleAccessor(datum);
    const inner = datum.innerRadius ?? innerRadius;
    const outer = datum.outerRadius ?? outerRadius;
    const pad = datum.padAngle ?? padAngle;

    if (isNaN(startAngle) || isNaN(endAngle) || isNaN(inner) || isNaN(outer)) {
      return null;
    }

    const angle = endAngle - startAngle - pad;
    if (angle <= 0) return null;

    const startAngleAdjusted = startAngle + pad / 2;
    const endAngleAdjusted = endAngle - pad / 2;

    const x0 = Math.cos(startAngleAdjusted);
    const y0 = Math.sin(startAngleAdjusted);
    const x1 = Math.cos(endAngleAdjusted);
    const y1 = Math.sin(endAngleAdjusted);

    const largeArc = angle > Math.PI ? 1 : 0;

    let path = '';
    if (inner > 0) {
      path += `M${x1 * inner},${y1 * inner}`;
      path += `A${inner},${inner} 0 ${largeArc},0 ${x0 * inner},${y0 * inner}`;
      path += `L${x0 * outer},${y0 * outer}`;
    } else {
      path += `M${x0 * outer},${y0 * outer}`;
    }

    path += `A${outer},${outer} 0 ${largeArc},1 ${x1 * outer},${y1 * outer}`;

    if (inner > 0) {
      path += 'Z';
    } else {
      path += 'L0,0Z';
    }

    return path;
  } as ArcGenerator<T>;

  generator.innerRadius = function (radius: number): ArcGenerator<T> {
    innerRadius = radius;
    return generator;
  };

  generator.outerRadius = function (radius: number): ArcGenerator<T> {
    outerRadius = radius;
    return generator;
  };

  generator.startAngle = function (accessor: (d: T) => number): ArcGenerator<T> {
    startAngleAccessor = accessor;
    return generator;
  };

  generator.endAngle = function (accessor: (d: T) => number): ArcGenerator<T> {
    endAngleAccessor = accessor;
    return generator;
  };

  generator.padAngle = function (angle: number): ArcGenerator<T> {
    padAngle = angle;
    return generator;
  };

  generator.centroid = function (datum: T): [number, number] {
    const startAngle = startAngleAccessor(datum);
    const endAngle = endAngleAccessor(datum);
    const inner = datum.innerRadius ?? innerRadius;
    const outer = datum.outerRadius ?? outerRadius;

    const angle = (startAngle + endAngle) / 2;
    const radius = (inner + outer) / 2;

    return [Math.cos(angle) * radius, Math.sin(angle) * radius];
  };

  return generator;
}

/**
 * Pie generator implementation to replace d3-shape pie
 */
export type PieArcDatum<T> = ArcDatum & {
  data: T;
  value: number;
  index: number;
};

export type PieGenerator<T> = {
  value(accessor?: (d: T) => number): ((d: T) => number) | PieGenerator<T>;
  sort(
    comparator?: (a: T, b: T) => number
  ): ((a: T, b: T) => number) | null | PieGenerator<T>;
  sortValues(
    comparator?: (a: number, b: number) => number
  ): ((a: number, b: number) => number) | null | PieGenerator<T>;
  padAngle(angle?: number): number | PieGenerator<T>;
  (data: T[]): PieArcDatum<T>[];
};

export function pie<T = number>(): PieGenerator<T> {
  let valueAccessor: (d: T) => number = (d: any) => (typeof d === 'number' ? d : 0);
  let sortComparator: ((a: T, b: T) => number) | null = null;
  let sortValuesComparator: ((a: number, b: number) => number) | null = null;
  let padAngle = 0;

  const generator = function (data: T[]): PieArcDatum<T>[] {
    if (!data || data.length === 0) return [];

    const values = data.map(valueAccessor);
    const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);

    if (total === 0) {
      return data.map((d, i) => ({
        data: d,
        value: 0,
        index: i,
        startAngle: 0,
        endAngle: 0,
      }));
    }

    let arcs: PieArcDatum<T>[] = data.map((d, i) => ({
      data: d,
      value: values[i],
      index: i,
      startAngle: 0,
      endAngle: 0,
    }));

    if (sortComparator) {
      arcs = arcs.sort((a, b) => sortComparator!(a.data, b.data));
    } else if (sortValuesComparator) {
      arcs = arcs.sort((a, b) => sortValuesComparator!(a.value, b.value));
    }

    let currentAngle = -Math.PI / 2;
    const anglePerValue = (2 * Math.PI - padAngle * data.length) / total;

    arcs = arcs.map(arc => {
      const angle = arc.value * anglePerValue;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle + padAngle;
      return {
        ...arc,
        startAngle,
        endAngle,
        padAngle,
      };
    });

    return arcs;
  } as PieGenerator<T>;

  generator.value = function (accessor?: (d: T) => number): ((d: T) => number) | PieGenerator<T> {
    if (accessor === undefined) return valueAccessor;
    valueAccessor = accessor;
    return generator;
  };

  generator.sort = function (comparator?: (a: T, b: T) => number): ((a: T, b: T) => number) | null | PieGenerator<T> {
    if (comparator === undefined) return sortComparator;
    sortComparator = comparator;
    return generator;
  };

  generator.sortValues = function (comparator?: (a: number, b: number) => number): ((a: number, b: number) => number) | null | PieGenerator<T> {
    if (comparator === undefined) return sortValuesComparator;
    sortValuesComparator = comparator;
    return generator;
  };

  generator.padAngle = function (angle?: number): number | PieGenerator<T> {
    if (angle === undefined) return padAngle;
    padAngle = angle;
    return generator;
  };

  return generator;
}

