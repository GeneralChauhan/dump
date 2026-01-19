type PathCommand = {
  type: string;
  values: number[];
};

function parsePath(path: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const regex = /([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;

  while ((match = regex.exec(path)) !== null) {
    const type = match[1];
    const valuesStr = match[2].trim();
    const values = valuesStr
      .split(/[\s,]+/)
      .filter(s => s.length > 0)
      .map(Number)
      .filter(n => !isNaN(n));

    commands.push({ type: type.toUpperCase(), values });
  }

  return commands;
}

function normalizeCommands(commands: PathCommand[]): PathCommand[] {
  const normalized: PathCommand[] = [];
  let currentX = 0;
  let currentY = 0;

  for (const cmd of commands) {
    const { type, values } = cmd;
    const normalizedCmd: PathCommand = { type, values: [] };

    switch (type) {
      case 'M':
        normalizedCmd.values = [...values];
        if (values.length >= 2) {
          currentX = values[0];
          currentY = values[1];
        }
        normalized.push(normalizedCmd);
        break;

      case 'L':
        normalizedCmd.values = [currentX, currentY, ...values];
        if (values.length >= 2) {
          currentX = values[0];
          currentY = values[1];
        }
        normalized.push(normalizedCmd);
        break;

      case 'Z':
        normalizedCmd.values = [currentX, currentY];
        normalized.push(normalizedCmd);
        break;

      default:
        if (values.length >= 2) {
          normalizedCmd.values = [currentX, currentY, ...values];
          currentX = values[values.length - 2] ?? currentX;
          currentY = values[values.length - 1] ?? currentY;
        } else {
          normalizedCmd.values = [currentX, currentY, ...values];
        }
        normalized.push(normalizedCmd);
        break;
    }
  }

  return normalized;
}

function interpolateCommand(
  cmdA: PathCommand,
  cmdB: PathCommand,
  t: number
): PathCommand {
  const maxLength = Math.max(cmdA.values.length, cmdB.values.length);
  const interpolated: number[] = [];

  for (let i = 0; i < maxLength; i++) {
    const a = cmdA.values[i] ?? 0;
    const b = cmdB.values[i] ?? 0;
    interpolated.push(a + (b - a) * t);
  }

  return {
    type: cmdA.type,
    values: interpolated,
  };
}

function pathToString(commands: PathCommand[]): string {
  let path = '';

  for (const cmd of commands) {
    const { type, values } = cmd;

    switch (type) {
      case 'M':
        if (values.length >= 2) {
          path += `M${values[0]},${values[1]}`;
        }
        break;

      case 'L':
        if (values.length >= 4) {
          // Normalized L command has [x0, y0, x1, y1]
          path += `L${values[2]},${values[3]}`;
        } else if (values.length >= 2) {
          path += `L${values[0]},${values[1]}`;
        }
        break;

      case 'Z':
        path += 'Z';
        break;

      default:
        if (values.length > 0) {
          path += type + values.join(',');
        }
        break;
    }
  }

  return path;
}

export function interpolatePath(pathA: string, pathB: string, t: number): string {
  if (t <= 0) return pathA;
  if (t >= 1) return pathB;

  const commandsA = normalizeCommands(parsePath(pathA));
  const commandsB = normalizeCommands(parsePath(pathB));

  const maxLength = Math.max(commandsA.length, commandsB.length);
  const interpolated: PathCommand[] = [];

  for (let i = 0; i < maxLength; i++) {
    const cmdA = commandsA[i] ?? commandsA[commandsA.length - 1];
    const cmdB = commandsB[i] ?? commandsB[commandsB.length - 1];

    if (cmdA && cmdB) {
      interpolated.push(interpolateCommand(cmdA, cmdB, t));
    } else if (cmdA) {
      interpolated.push(cmdA);
    } else if (cmdB) {
      interpolated.push(cmdB);
    }
  }

  return pathToString(interpolated);
}

export function createPathInterpolator(
  pathA: string,
  pathB: string
): (t: number) => string {
  return (t: number) => interpolatePath(pathA, pathB, t);
}

