import type { JSONPath, JSONPathItem } from "../../../logic/types";

type ObjectLike = Record<JSONPathItem, unknown>;

function objIsObjectLike(obj: unknown): obj is ObjectLike {
  return typeof obj === "object" && obj !== null;
}

function getProperty(path: JSONPath, obj: ObjectLike): ObjectLike | undefined {
  return path.reduce((currentObject: unknown, pathItem: JSONPathItem) => {
    if (objIsObjectLike(currentObject) && Object.hasOwn(currentObject, pathItem)) {
      return currentObject[pathItem];
    }
    return undefined;
  }, obj) as ObjectLike | undefined;
}

/**
 * Update a value on an object by given path.
 * Returns a clone of the object. The input object is not changed
 * @param {unknown} obj object to dive into
 * @param {JSONPath} path array of strings and numbers
 * @param {unknown} value value to place at the end of the path
 * @returns new object with value updated
 * @throws errors if path is incorrect, or object is not actually an object
 */
// TODO infer type
export function updateNode<T>(obj: T, path: JSONPath, value: unknown): T {
  if (!objIsObjectLike(obj)) throw new Error(`Error in updateNode, expected obj to be an object`);

  const clonedObj = structuredClone(obj);
  const clonedPath = structuredClone(path);

  const lastPathItem = clonedPath.pop();

  // When empty path array is passed, "replace" all the object by returning the value
  if (lastPathItem === undefined) return structuredClone(value) as T;

  const parent = getProperty(clonedPath, clonedObj);
  if (parent === undefined) throw new Error("Error in updateNode, path result is undefined");
  if (!objIsObjectLike(parent) || !Object.hasOwn(parent, lastPathItem))
    throw new Error("Error in updateNode, object doesn't have property");

  // Mutating clone
  parent[lastPathItem] = value;
  return clonedObj;
}
