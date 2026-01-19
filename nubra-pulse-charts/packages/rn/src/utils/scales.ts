export type LinearScale = {
  domain(newDomain?: [number, number]): [number, number] | LinearScale;
  range(newRange?: [number, number]): [number, number] | LinearScale;
  (value: number): number;
  invert(value: number): number;
  ticks(count?: number): number[];
  nice(count?: number): LinearScale;
};

export function scaleLinear(): LinearScale {
  let domain: [number, number] = [0, 1];
  let range: [number, number] = [0, 1];
  let niceCount: number | undefined;

  const scale = function (value: number): number {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    if (d0 === d1) return (r0 + r1) / 2;
    const t = (value - d0) / (d1 - d0);
    return r0 + t * (r1 - r0);
  } as LinearScale;

  scale.domain = function (newDomain?: [number, number]): [number, number] | LinearScale {
    if (newDomain === undefined) return domain;
    domain = newDomain;
    if (niceCount !== undefined) {
      scale.nice(niceCount);
    }
    return scale;
  };

  scale.range = function (newRange?: [number, number]): [number, number] | LinearScale {
    if (newRange === undefined) return range;
    range = newRange;
    return scale;
  };

  scale.invert = function (value: number): number {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    if (r0 === r1) return (d0 + d1) / 2;
    const t = (value - r0) / (r1 - r0);
    return d0 + t * (d1 - d0);
  };

  scale.ticks = function (count: number = 10): number[] {
    const [d0, d1] = domain;
    if (d0 === d1) return [d0];
    
    const step = (d1 - d0) / count;
    const ticks: number[] = [];
    for (let i = 0; i <= count; i++) {
      ticks.push(d0 + step * i);
    }
    return ticks;
  };

  scale.nice = function (count?: number): LinearScale {
    niceCount = count;
    if (count === undefined) {
      const [d0, d1] = domain;
      const step = niceStep(d1 - d0);
      domain = [Math.floor(d0 / step) * step, Math.ceil(d1 / step) * step];
    } else {
      const [d0, d1] = domain;
      const step = (d1 - d0) / count;
      const niceStepValue = niceStep(step);
      domain = [Math.floor(d0 / niceStepValue) * niceStepValue, Math.ceil(d1 / niceStepValue) * niceStepValue];
    }
    return scale;
  };

  return scale;
}

function niceStep(step: number): number {
  const magnitude = Math.floor(Math.log10(Math.abs(step)));
  const magnitudeValue = Math.pow(10, magnitude);
  const normalizedStep = step / magnitudeValue;
  
  let niceNormalizedStep: number;
  if (normalizedStep <= 1) niceNormalizedStep = 1;
  else if (normalizedStep <= 2) niceNormalizedStep = 2;
  else if (normalizedStep <= 5) niceNormalizedStep = 5;
  else niceNormalizedStep = 10;
  
  return niceNormalizedStep * magnitudeValue;
}

export type BandScale = {
  domain(newDomain?: string[]): string[] | BandScale;
  range(newRange?: [number, number]): [number, number] | BandScale;
  padding(newPadding?: number): number | BandScale;
  paddingInner(newPadding?: number): number | BandScale;
  paddingOuter(newPadding?: number): number | BandScale;
  (value: string): number | undefined;
  bandwidth(): number;
  step(): number;
};

export function scaleBand(): BandScale {
  let domain: string[] = [];
  let range: [number, number] = [0, 1];
  let paddingInner = 0;
  let paddingOuter = 0;

  const scale = function (value: string): number | undefined {
    const index = domain.indexOf(value);
    if (index === -1) return undefined;
    return getBandPosition(index);
  } as BandScale;

  function getBandPosition(index: number): number {
    const [r0, r1] = range;
    const n = domain.length;
    if (n === 0) return r0;
    
    const step = (r1 - r0) / (n + paddingOuter * 2 - paddingInner);
    return r0 + paddingOuter * step + index * step;
  }

  scale.domain = function (newDomain?: string[]): string[] | BandScale {
    if (newDomain === undefined) return domain;
    domain = newDomain;
    return scale;
  };

  scale.range = function (newRange?: [number, number]): [number, number] | BandScale {
    if (newRange === undefined) return range;
    range = newRange;
    return scale;
  };

  scale.padding = function (newPadding?: number): number | BandScale {
    if (newPadding === undefined) return paddingInner;
    paddingInner = newPadding;
    paddingOuter = newPadding;
    return scale;
  };

  scale.paddingInner = function (newPadding?: number): number | BandScale {
    if (newPadding === undefined) return paddingInner;
    paddingInner = newPadding;
    return scale;
  };

  scale.paddingOuter = function (newPadding?: number): number | BandScale {
    if (newPadding === undefined) return paddingOuter;
    paddingOuter = newPadding;
    return scale;
  };

  scale.bandwidth = function (): number {
    const [r0, r1] = range;
    const n = domain.length;
    if (n === 0) return 0;
    const step = (r1 - r0) / (n + paddingOuter * 2 - paddingInner);
    return step * (1 - paddingInner);
  };

  scale.step = function (): number {
    const [r0, r1] = range;
    const n = domain.length;
    if (n === 0) return 0;
    return (r1 - r0) / (n + paddingOuter * 2 - paddingInner);
  };

  return scale;
}

export type TimeScale = {
  domain(
    newDomain?: [Date | number, Date | number]
  ): [Date | number, Date | number] | TimeScale;
  range(newRange?: [number, number]): [number, number] | TimeScale;
  (value: Date | number): number;
  invert(value: number): number;
  ticks(count?: number): (Date | number)[];
};

export function scaleTime(): TimeScale {
  let domain: [Date | number, Date | number] = [new Date(0), new Date(1)];
  let range: [number, number] = [0, 1];

  const scale = function (value: Date | number): number {
    const d0 = typeof domain[0] === 'number' ? domain[0] : domain[0].getTime();
    const d1 = typeof domain[1] === 'number' ? domain[1] : domain[1].getTime();
    const [r0, r1] = range;
    const v = typeof value === 'number' ? value : value.getTime();
    
    if (d0 === d1) return (r0 + r1) / 2;
    const t = (v - d0) / (d1 - d0);
    return r0 + t * (r1 - r0);
  } as TimeScale;

  scale.domain = function (newDomain?: [Date | number, Date | number]): [Date | number, Date | number] | TimeScale {
    if (newDomain === undefined) return domain;
    domain = newDomain;
    return scale;
  };

  scale.range = function (newRange?: [number, number]): [number, number] | TimeScale {
    if (newRange === undefined) return range;
    range = newRange;
    return scale;
  };

  scale.invert = function (value: number): number {
    const d0 = typeof domain[0] === 'number' ? domain[0] : domain[0].getTime();
    const d1 = typeof domain[1] === 'number' ? domain[1] : domain[1].getTime();
    const [r0, r1] = range;
    if (r0 === r1) return (d0 + d1) / 2;
    const t = (value - r0) / (r1 - r0);
    return d0 + t * (d1 - d0);
  };

  scale.ticks = function (count: number = 10): (Date | number)[] {
    const d0 = typeof domain[0] === 'number' ? domain[0] : domain[0].getTime();
    const d1 = typeof domain[1] === 'number' ? domain[1] : domain[1].getTime();
    if (d0 === d1) return [domain[0]];
    
    const step = (d1 - d0) / count;
    const ticks: (Date | number)[] = [];
    for (let i = 0; i <= count; i++) {
      const tick = d0 + step * i;
      ticks.push(typeof domain[0] === 'number' ? tick : new Date(tick));
    }
    return ticks;
  };

  return scale;
}

