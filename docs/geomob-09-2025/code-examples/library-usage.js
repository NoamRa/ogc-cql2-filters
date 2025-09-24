import { parse } from "cql2-filters-parser";

const { encoding, expression } = parse("event='Geomob'");

console.log(encoding); // -> Text
console.log(expression.toText()); // -> "event = 'Geomob'"
console.log(expression.toJSON()); // ->
// {
//   op: '=',
//   args: [ { property: 'event' }, 'Geomob' ]
// }
