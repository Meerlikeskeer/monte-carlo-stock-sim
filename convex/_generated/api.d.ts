/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib_gbm from "../lib/gbm.js";
import type * as lib_rng from "../lib/rng.js";
import type * as lib_sampling from "../lib/sampling.js";
import type * as lib_stats from "../lib/stats.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_yahoo from "../lib/yahoo.js";
import type * as simulate from "../simulate.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "lib/gbm": typeof lib_gbm;
  "lib/rng": typeof lib_rng;
  "lib/sampling": typeof lib_sampling;
  "lib/stats": typeof lib_stats;
  "lib/types": typeof lib_types;
  "lib/yahoo": typeof lib_yahoo;
  simulate: typeof simulate;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
