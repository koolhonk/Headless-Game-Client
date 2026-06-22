import fs from 'fs';
import path from 'path';

export type UserConfig = [string, number, string, any[]];

export const userMapping: Map<string, UserConfig> = loadUserMapping();

function loadUserMapping(): Map<string, UserConfig> {
  // user mapping will be csv of lines username,password,world,scriptName,scriptParam1,...,scriptParamN
  // TODO add proxy mappings - randomly delegate accounts to these proxies, 6 acc per world per proxy
  const csvPath = path.resolve(process.cwd(), 'config', 'userMapping.csv');

  const lines = fs
    .readFileSync(csvPath, 'utf-8')
    .trim()
    .split('\n');

  const map = new Map<string, UserConfig>();

  for (const line of lines) {
    const [
      username,
      password,
      world,
      script,
      ...scriptParams
    ] = line.split(',');

    map.set(username, [
      password,
      Number(world),
      script,
      scriptParams.map(parseValue),
    ]);
  }

  return map;
}

function parseValue(value: string): any {
  value = value.trim();

  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }

  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }

  return value;
}