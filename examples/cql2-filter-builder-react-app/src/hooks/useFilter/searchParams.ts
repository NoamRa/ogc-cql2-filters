const CQL_SEARCH_PARAM = "cql";

export function initFromURLSearchParam(fallbackFilter: string): string {
  const value = new URLSearchParams(window.location.search).get(CQL_SEARCH_PARAM);
  return value ? value : fallbackFilter;
}

export function updateURLSearchParam(filter: string): void {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.set(CQL_SEARCH_PARAM, filter);

  // Update the browser's URL without reloading the page
  // TODO better implementation where user can go back and and forward
  window.history.replaceState(null, "", `${url.pathname}?${searchParams.toString()}`);
}
