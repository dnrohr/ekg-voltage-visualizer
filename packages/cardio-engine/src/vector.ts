import type { Vec3 } from "./types";

export const add = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z
});

export const scale = (vector: Vec3, amount: number): Vec3 => ({
  x: vector.x * amount,
  y: vector.y * amount,
  z: vector.z * amount
});

export const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;

export const magnitude = (vector: Vec3): number =>
  Math.sqrt(dot(vector, vector));

export const normalize = (vector: Vec3): Vec3 => {
  const length = magnitude(vector);

  if (length === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return scale(vector, 1 / length);
};
