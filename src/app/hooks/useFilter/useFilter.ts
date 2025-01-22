import { useReducer } from "react";
import { Expression } from "../../../logic/Entities/Expression";
import parseJSON from "../../../logic/parser/parseJSON";
import parseText from "../../../logic/parser/parseText";
import scanText from "../../../logic/scanner/scanText";
import { JSONPath } from "../../../logic/types";
import { updateNode } from "./updateNode";

// #region types
type ParseResult =
  | { encoding: "Text"; expression: Expression }
  | { encoding: "JSON"; expression: Expression }
  | { error: Error };

type ActionKind = "change" | "updateNode";

type FilterState = ParseResult & { filter: string };

interface ActionBase {
  type: ActionKind;
  payload: unknown;
}
interface ChangeAction extends ActionBase {
  type: "change";
  payload: string;
}
interface UpdateNodeAction extends ActionBase {
  type: "updateNode";
  payload: { path: JSONPath; value: unknown };
}

// register all actions
type Action = ChangeAction | UpdateNodeAction;

// #endregion

// #region reducer
function createFilterState(filter: string): FilterState {
  return {
    filter,
    ...parse(filter),
  };
}

function initializeFilterState(fallbackFilter: string): FilterState {
  return createFilterState(initFromURLSearchParam(fallbackFilter));
}

function filterStateReducer(prevState: FilterState, action: Action): FilterState {
  switch (action.type) {
    case "change": {
      return createFilterState(action.payload);
    }
    case "updateNode": {
      if ("error" in prevState) {
        // should not happen, can't update node if JSON it doesn't exist...
        console.error({ problem: "issue with update node", prevState, action });
        return prevState;
      }

      const prevJSON = prevState.expression.toJSON();
      const nextJSON = updateNode(prevJSON, action.payload.path, action.payload.value);
      const parseResult = parse(nextJSON as object);
      if ("error" in parseResult) {
        // should not happen, can't update node if JSON it doesn't exist...
        console.error({ problem: "issue with update node", prevState, action });
        return { filter: prevState.filter, ...parseResult };
      }

      const { encoding } = prevState; // format user expects
      const { expression } = parseResult;
      const filter = encoding === "JSON" ? JSON.stringify(expression.toJSON(), null, 2) : expression.toText();

      return {
        filter,
        encoding,
        expression,
      };
    }
  }
}

export function useFilterState(initialFilter: string) {
  const [filterState, dispatch] = useReducer(filterStateReducer, initialFilter, initializeFilterState);

  const setFilter = (filter: string) => {
    dispatch({ type: "change", payload: filter });
    updateURLSearchParam(filter);
  };

  const updateNode = (path: JSONPath, value: unknown) => {
    dispatch({ type: "updateNode", payload: { path, value } });
    updateURLSearchParam(filterState.filter);
  };

  return { filterState, setFilter, updateNode };
}
// #endregion

// #region parse
function parse(input: string | object): ParseResult {
  try {
    if (typeof input === "object") {
      return {
        expression: parseJSON(input),
        encoding: "JSON",
      };
    }
    if (typeof input === "string") {
      if (input.startsWith("{")) {
        return {
          expression: parseJSON(JSON.parse(input) as object),
          encoding: "JSON",
        };
      }
      return {
        expression: parseText(scanText(input)),
        encoding: "Text",
      };
    }
    return { error: new Error("Failed to detect input type, expecting string for CQL2 Text or object for CQL2 JSON") };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error("Failed to parse input") };
  }
}
// #endregion

// #region search param
const CQL_SEARCH_PARAM = "cql";

function initFromURLSearchParam(fallbackFilter: string): string {
  const value = new URLSearchParams(window.location.search).get(CQL_SEARCH_PARAM);
  return value ? value : fallbackFilter;
}

function updateURLSearchParam(filter: string): void {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.set(CQL_SEARCH_PARAM, filter);

  // Update the browser's URL without reloading the page
  window.history.replaceState(null, "", `${url.pathname}?${searchParams.toString()}`);
}
// #endregion
