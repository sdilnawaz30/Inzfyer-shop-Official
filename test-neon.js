import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";
import type { util } from "zod/v4/core";

test("z.boolean", () => {
  const a = z.boolean();
  expect(z.parse(a, true)).toEqual(true);
  expect(z.parse(a, false)).toEqual(false);
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, "true")).toThrow();
  type a = z.output<typeof a>;
  expectTypeOf<a>().toEqualTypeOf<boolean>();
});

test("z.bigint", () => {
  const a = z.bigint();
  expect(z.parse(a, BigInt(123))).toEqual(BigInt(123));
  expect(() => z.parse(a, 123)).toThrow();
  expect(() => z.parse(a, "123")).toThrow();
});

test("z.symbol", () => {
  const a = z.symbol();
  const sym = Symbol();
  expect(z.parse(a, sym)).toEqual(sym);
  expect(() => z.parse(a, "symbol")).toThrow();
});

test("z.date", () => {
  const a = z.date();
  const date = new Date();
  expect(z.parse(a, date)).toEqual(date);
  expect(() => z.parse(a, "date")).toThrow();
});

test("z.coerce.string", () => {
  const a = z.coerce.string();
  expect(z.parse(a, 123)).toEqual("123");
  expect(z.parse(a, true)).toEqual("true");
  expect(z.parse(a, null)).toEqual("null");
  expect(z.parse(a, undefined)).toEqual("undefined");
});

test("z.coerce.number", () => {
  const a = z.coerce.number();
  expect(z.parse(a, "123")).toEqual(123);
  expect(z.parse(a, "123.45")).toEqual(123.45);
  expect(z.parse(a, true)).toEqual(1);
  expect(z.parse(a, false)).toEqual(0);
  expect(() => z.parse(a, "abc")).toThrow();
});

test("z.coerce.boolean", () => {
  const a = z.coerce.boolean();
  // test booleans
  expect(z.parse(a, true)).toEqual(true);
  expect(z.parse(a, false)).toEqual(false);
  expect(z.parse(a, "true")).toEqual(true);
