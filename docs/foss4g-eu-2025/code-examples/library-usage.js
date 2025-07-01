import { parse } from "cql2-filters-parser";

const { encoding, expression } = parse("city='Mostar'");

console.log(encoding); // -> Text
console.log(expression.toText()); // -> "city = 'Mostar'"
console.log(expression.toJSON()); // ->
// {
//   op: '=',
//   args: [ { property: 'city' }, 'Mostar' ]
// }
