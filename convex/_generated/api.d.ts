/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiHelpers from "../aiHelpers.js";
import type * as getDashboardModules from "../getDashboardModules.js";
import type * as nisrData from "../nisrData.js";
import type * as queries from "../queries.js";
import type * as searchFederated from "../searchFederated.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiHelpers: typeof aiHelpers;
  getDashboardModules: typeof getDashboardModules;
  nisrData: typeof nisrData;
  queries: typeof queries;
  searchFederated: typeof searchFederated;
  seed: typeof seed;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
