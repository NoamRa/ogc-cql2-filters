import { useEffect, useReducer } from "react";
import type { JSONPath } from "../../../logic/types";
import { parse, ParseResult } from "./parse";
import { initFromURLSearchParam, updateURLSearchParam } from "./searchParams";
import { updateNode } from "./updateNode";

// #region types
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

// Action union
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

  useEffect(() => {
    updateURLSearchParam(filterState.filter);
  }, [filterState.filter]);

  const setFilter = (filter: string) => {
    dispatch({ type: "change", payload: filter });
  };

  const updateNode = (path: JSONPath, value: unknown) => {
    dispatch({ type: "updateNode", payload: { path, value } });
  };

  return { filterState, setFilter, updateNode };
}
// #endregion
