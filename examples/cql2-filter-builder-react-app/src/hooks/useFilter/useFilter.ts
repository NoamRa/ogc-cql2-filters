import { parse, type JSONPath, type ParseResult } from "cql2-filters-parser";
import { useEffect, useReducer } from "react";
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

export type UserFilterState = ReturnType<typeof useFilterState>;

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
        // Should'nt happen, how can update node be called if JSON it doesn't exist?
        console.error({ problem: "issue with update node", prevState, action });
        return prevState;
      }

      const nextJSON = updateNode(prevState.expression.toJSON(), action.payload.path, action.payload.value);
      const parseResult = parse(nextJSON as object);
      if ("error" in parseResult) {
        return { filter: prevState.filter, ...parseResult };
      }

      // Keep encoding from previous state so textarea will be kept with same format
      // even if updateNode returns JSON
      const encoding = prevState.encoding;
      const filter =
        encoding === "Text" ?
          parseResult.expression.toText()
        : JSON.stringify(parseResult.expression.toJSON(), null, 2);

      return {
        expression: parseResult.expression,
        encoding,
        filter,
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
