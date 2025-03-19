type JsonAndPrimitives = object | string | number | boolean | null;

interface TestCase {
  name: string;
  input: {
    text: string;
    json: JsonAndPrimitives;
  };
  expected: {
    text: string;
    /** JSON input doesn't have some concepts such as parentheses. In that case, use textForJson */
    textForJson?: string;
    json: JsonAndPrimitives;
  };
}

const PRIMITIVES: TestCase[] = [
  {
    name: "Empty, just EOF",
    input: {
      text: "",
      json: "",
    },
    expected: {
      text: "",
      json: "",
    },
  },
  {
    name: "number",
    input: {
      text: "123",
      json: 123,
    },
    expected: {
      text: "123",
      json: 123,
    },
  },
  {
    name: "decimal number",
    input: {
      text: "123.456",
      json: 123.456,
    },
    expected: {
      text: "123.456",
      json: 123.456,
    },
  },
  {
    name: "negative number",
    input: {
      text: "-456",
      json: -456,
    },
    expected: {
      text: "-456",
      json: -456,
    },
  },
  {
    name: "string (wrapped in quotes)",
    input: {
      text: "'hello world'",
      json: "hello world",
    },
    expected: {
      text: "'hello world'",
      json: "hello world",
    },
  },
  {
    name: "strings",
    input: {
      text: "'foo' <> 'bar'",
      json: { op: "<>", args: ["foo", "bar"] },
    },
    expected: {
      text: "'foo' <> 'bar'",
      json: { op: "<>", args: ["foo", "bar"] },
    },
  },
  {
    name: "booleans",
    input: {
      text: "TRUE<>FALSE",
      json: { op: "<>", args: [true, false] },
    },
    expected: {
      text: "TRUE <> FALSE",
      json: { op: "<>", args: [true, false] },
    },
  },
  {
    name: "null",
    input: {
      text: "NULL",
      json: null,
    },
    expected: {
      text: "NULL",
      json: null,
    },
  },
];

const ARITHMETIC: TestCase[] = [
  {
    name: "addition",
    input: {
      text: "3+4",
      json: { op: "+", args: [3, 4] },
    },
    expected: {
      text: "3 + 4",
      json: { op: "+", args: [3, 4] },
    },
  },
  {
    name: "subtraction",
    input: {
      text: "5-6",
      json: { op: "-", args: [5, 6] },
    },
    expected: {
      text: "5 - 6",
      json: { op: "-", args: [5, 6] },
    },
  },
  {
    name: "addition of negative number",
    input: {
      text: "5 + -6",
      json: { op: "+", args: [5, -6] },
    },
    expected: {
      text: "5 + -6",
      json: { op: "+", args: [5, -6] },
    },
  },
  {
    name: "subtracting a property",
    input: {
      text: "vehicle_height > (bridge_clearance - 1)",
      json: {
        op: ">",
        args: [
          {
            property: "vehicle_height",
          },
          {
            op: "-",
            args: [
              {
                property: "bridge_clearance",
              },
              1,
            ],
          },
        ],
      },
    },
    expected: {
      text: "vehicle_height > (bridge_clearance - 1)",
      textForJson: "vehicle_height > bridge_clearance - 1",
      json: {
        op: ">",
        args: [
          {
            property: "vehicle_height",
          },
          {
            op: "-",
            args: [
              {
                property: "bridge_clearance",
              },
              1,
            ],
          },
        ],
      },
    },
  },
  {
    name: "order of precedence",
    input: {
      text: "3 * 1 + 2",
      json: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
    },
    expected: {
      text: "3 * 1 + 2",
      json: { op: "+", args: [{ op: "*", args: [3, 1] }, 2] },
    },
  },
];

const COMPARISON: TestCase[] = [
  {
    name: "comparison with property",
    input: {
      text: "cloudCoverage>=50",
      json: { op: ">=", args: [{ property: "cloudCoverage" }, 50] },
    },
    expected: { text: "cloudCoverage >= 50", json: { op: ">=", args: [{ property: "cloudCoverage" }, 50] } },
  },
  {
    name: "comparison with property other direction",
    input: {
      text: "50>= cloudCoverage",
      json: { op: ">=", args: [50, { property: "cloudCoverage" }] },
    },
    expected: { text: "50 >= cloudCoverage", json: { op: ">=", args: [50, { property: "cloudCoverage" }] } },
  },
  {
    name: "arithmetic has higher precedence than comparisons",
    input: {
      text: "cloudCoverage >= 10+20",
      json: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
    },
    expected: {
      text: "cloudCoverage >= 10 + 20",
      json: { op: ">=", args: [{ property: "cloudCoverage" }, { op: "+", args: [10, 20] }] },
    },
  },
  {
    name: "arithmetic has higher precedence than comparisons other direction",
    input: {
      text: "10+20 >= cloudCoverage",
      json: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
    },
    expected: {
      text: "10 + 20 >= cloudCoverage",
      json: { op: ">=", args: [{ op: "+", args: [10, 20] }, { property: "cloudCoverage" }] },
    },
  },
  {
    name: "equal",
    input: {
      text: "3=(2 + 1)",
      json: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
    },
    expected: {
      text: "3 = (2 + 1)",
      textForJson: "3 = 2 + 1",
      json: { op: "=", args: [3, { op: "+", args: [2, 1] }] },
    },
  },
  {
    name: "not equal",
    input: {
      text: "4 <> 5 ",
      json: { op: "<>", args: [4, 5] },
    },
    expected: {
      text: "4 <> 5",
      json: { op: "<>", args: [4, 5] },
    },
  },
];

const IS_NOT_NULL: TestCase[] = [
  {
    name: "is null",
    input: {
      text: "geometry IS NULL",
      json: { op: "isNull", args: [{ property: "geometry" }] },
    },
    expected: {
      text: "geometry IS NULL",
      json: { op: "isNull", args: [{ property: "geometry" }] },
    },
  },
  {
    name: "is not null",
    input: {
      text: "geometry IS NOT NULL",
      json: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] },
    },
    expected: {
      text: "geometry IS NOT NULL",
      json: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] },
    },
  },
];

const FUNCTION_GROUPING: TestCase[] = [
  {
    name: "grouping and precedence - left",
    input: {
      text: "2*(3+1)",
      json: { op: "*", args: [2, { op: "+", args: [3, 1] }] },
    },
    expected: {
      text: "2 * (3 + 1)",
      json: { op: "*", args: [2, { op: "+", args: [3, 1] }] },
    },
  },
  {
    name: "grouping and precedence - right",
    input: {
      text: "(3+1) * 2",
      json: { op: "*", args: [{ op: "+", args: [3, 1] }, 2] },
    },
    expected: {
      text: "(3 + 1) * 2",
      json: { op: "*", args: [{ op: "+", args: [3, 1] }, 2] },
    },
  },
  {
    name: "function over literals",
    input: {
      text: "add ( 4 , 5 )",
      json: { op: "add", args: [4, 5] },
    },
    expected: { text: "add(4, 5)", json: { op: "add", args: [4, 5] } },
  },
  {
    name: "function over property",
    input: {
      text: "avg ( windSpeed )",
      json: { op: "avg", args: [{ property: "windSpeed" }] },
    },
    expected: { text: "avg(windSpeed)", json: { op: "avg", args: [{ property: "windSpeed" }] } },
  },
];

const TEMPORAL: TestCase[] = [
  {
    name: "calendar date",
    input: {
      text: "DATE('1999-11-05')",
      json: { date: "1999-11-05" },
    },
    expected: {
      text: "DATE('1999-11-05')",
      json: { date: "1999-11-05" },
    },
  },
  {
    name: "timestamp",
    input: {
      text: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
      json: { timestamp: "1999-01-15T13:45:23.000Z" },
    },
    expected: {
      text: "TIMESTAMP('1999-01-15T13:45:23.000Z')",
      json: { timestamp: "1999-01-15T13:45:23.000Z" },
    },
  },
];

const AND_OR_NOT: TestCase[] = [
  {
    name: "and",
    input: {
      text: "'foo' AND 'bar'",
      json: { op: "and", args: ["foo", "bar"] },
    },
    expected: {
      text: "'foo' AND 'bar'",
      json: { op: "and", args: ["foo", "bar"] },
    },
  },
  {
    name: "or",
    input: {
      text: "'foo' OR 'bar'",
      json: { op: "or", args: ["foo", "bar"] },
    },
    expected: {
      text: "'foo' OR 'bar'",
      json: { op: "or", args: ["foo", "bar"] },
    },
  },
  {
    name: "precedence - or before and",
    input: {
      text: "'foo' OR 'bar' AND 'baz'",
      json: { op: "or", args: ["foo", { op: "and", args: ["bar", "baz"] }] },
    },
    expected: {
      text: "'foo' OR 'bar' AND 'baz'",
      json: { op: "or", args: ["foo", { op: "and", args: ["bar", "baz"] }] },
    },
  },
  {
    name: "precedence - and before or",
    input: {
      text: "'foo' AND 'bar' OR 'baz'",
      json: { op: "or", args: [{ op: "and", args: ["foo", "bar"] }, "baz"] },
    },
    expected: {
      text: "'foo' AND 'bar' OR 'baz'",
      json: { op: "or", args: [{ op: "and", args: ["foo", "bar"] }, "baz"] },
    },
  },
  {
    name: "negation",
    input: {
      text: "NOT 'a'",
      json: { op: "not", args: ["a"] },
    },
    expected: {
      text: "NOT 'a'",
      json: { op: "not", args: ["a"] },
    },
  },
  {
    name: "complex negation",
    input: {
      text: "'a' AND NOT 'b'",
      json: { op: "and", args: ["a", { op: "not", args: ["b"] }] },
    },
    expected: {
      text: "'a' AND NOT 'b'",
      json: { op: "and", args: ["a", { op: "not", args: ["b"] }] },
    },
  },
];

const ADVANCED_COMPARISON: TestCase[] = [
  {
    name: "like",
    input: {
      text: "name LIKE 'Harrison%'",
      json: {
        op: "like",
        args: [{ property: "name" }, "Harrison%"],
      },
    },
    expected: {
      text: "name LIKE 'Harrison%'",
      json: {
        op: "like",
        args: [{ property: "name" }, "Harrison%"],
      },
    },
  },
  {
    name: "not like",
    input: {
      text: "name NOT LIKE 'McCartney%'",
      json: {
        op: "not",
        args: [
          {
            op: "like",
            args: [{ property: "name" }, "McCartney%"],
          },
        ],
      },
    },
    expected: {
      text: "name NOT LIKE 'McCartney%'",
      json: {
        op: "not",
        args: [
          {
            op: "like",
            args: [{ property: "name" }, "McCartney%"],
          },
        ],
      },
    },
  },
  {
    name: "between",
    input: {
      text: "depth BETWEEN 123 AND 456.7",
      json: {
        op: "between",
        args: [{ property: "depth" }, 123, 456.7],
      },
    },
    expected: {
      text: "depth BETWEEN 123 AND 456.7",
      json: {
        op: "between",
        args: [{ property: "depth" }, 123, 456.7],
      },
    },
  },
  {
    name: "complex between",
    input: {
      text: "depth - 1  BETWEEN  2+3 AND 4*5",
      json: {
        op: "between",
        args: [
          { op: "-", args: [{ property: "depth" }, 1] },
          { op: "+", args: [2, 3] },
          { op: "*", args: [4, 5] },
        ],
      },
    },
    expected: {
      text: "depth - 1 BETWEEN 2 + 3 AND 4 * 5",
      json: {
        op: "between",
        args: [
          { op: "-", args: [{ property: "depth" }, 1] },
          { op: "+", args: [2, 3] },
          { op: "*", args: [4, 5] },
        ],
      },
    },
  },
  {
    name: "not between",
    input: {
      text: "depth NOT BETWEEN 123 AND 456.7",
      json: {
        op: "not",
        args: [
          {
            op: "between",
            args: [{ property: "depth" }, 123, 456.7],
          },
        ],
      },
    },
    expected: {
      text: "depth NOT BETWEEN 123 AND 456.7",
      json: {
        op: "not",
        args: [
          {
            op: "between",
            args: [{ property: "depth" }, 123, 456.7],
          },
        ],
      },
    },
  },
  {
    name: "in",
    input: {
      text: "cityName IN ( 'Toronto','Frankfurt' , 'Tokyo','New York')",
      json: {
        op: "in",
        args: [{ property: "cityName" }, ["Toronto", "Frankfurt", "Tokyo", "New York"]],
      },
    },
    expected: {
      text: "cityName IN ('Toronto', 'Frankfurt', 'Tokyo', 'New York')",
      json: {
        op: "in",
        args: [{ property: "cityName" }, ["Toronto", "Frankfurt", "Tokyo", "New York"]],
      },
    },
  },
  {
    name: "not in",
    input: {
      text: "category  NOT IN (1 ,2,3, 4) ",
      json: {
        op: "not",
        args: [
          {
            op: "in",
            args: [{ property: "category" }, [1, 2, 3, 4]],
          },
        ],
      },
    },
    expected: {
      text: "category NOT IN (1, 2, 3, 4)",
      json: {
        op: "not",
        args: [
          {
            op: "in",
            args: [{ property: "category" }, [1, 2, 3, 4]],
          },
        ],
      },
    },
  },
];

const INSENSITIVE_COMPARISON: TestCase[] = [
  {
    name: "case-insensitive comparison",
    input: {
      text: "CASEI(road_class) IN (CASEI('Οδος'),CASEI('Straße'))",
      json: {
        op: "in",
        args: [
          {
            op: "casei",
            args: [{ property: "road_class" }],
          },
          [
            { op: "casei", args: ["Οδος"] },
            { op: "casei", args: ["Straße"] },
          ],
        ],
      },
    },
    expected: {
      text: "CASEI(road_class) IN (CASEI('Οδος'), CASEI('Straße'))",
      json: {
        op: "in",
        args: [
          {
            op: "casei",
            args: [{ property: "road_class" }],
          },
          [
            { op: "casei", args: ["Οδος"] },
            { op: "casei", args: ["Straße"] },
          ],
        ],
      },
    },
  },
  {
    name: "accent-insensitive comparison",
    input: {
      text: "ACCENTI(etat_vol) = ACCENTI('débárquér')",
      json: {
        op: "=",
        args: [
          {
            op: "accenti",
            args: [{ property: "etat_vol" }],
          },
          {
            op: "accenti",
            args: ["débárquér"],
          },
        ],
      },
    },
    expected: {
      text: "ACCENTI(etat_vol) = ACCENTI('débárquér')",
      json: {
        op: "=",
        args: [
          {
            op: "accenti",
            args: [{ property: "etat_vol" }],
          },
          {
            op: "accenti",
            args: ["débárquér"],
          },
        ],
      },
    },
  },
];

const SPATIAL: TestCase[] = [
  {
    name: "point",
    input: {
      text: "POINT(43.5845 -79.5442)",
      json: {
        type: "Point",
        coordinates: [43.5845, -79.5442],
      },
    },
    expected: {
      text: "POINT(43.5845 -79.5442)",
      json: {
        type: "Point",
        coordinates: [43.5845, -79.5442],
      },
    },
  },
  {
    name: "point 3d",
    input: {
      text: "POINT(-1.2 4.5 -6.7)",
      json: {
        type: "Point",
        coordinates: [-1.2, 4.5, -6.7],
      },
    },
    expected: {
      text: "POINT(-1.2 4.5 -6.7)",
      json: {
        type: "Point",
        coordinates: [-1.2, 4.5, -6.7],
      },
    },
  },
  {
    name: "bounding box",
    input: {
      text: "BBOX(160.6,-55.95,-170,-25.89)",
      json: {
        bbox: [160.6, -55.95, -170, -25.89],
      },
    },
    expected: {
      text: "BBOX(160.6, -55.95, -170, -25.89)",
      json: {
        bbox: [160.6, -55.95, -170, -25.89],
      },
    },
  },
  {
    name: "bounding box 3d",
    input: {
      text: "BBOX(1.2 ,-3.4, 5,6.7 ,-8,9)",
      json: {
        bbox: [1.2, -3.4, 5, 6.7, -8, 9],
      },
    },
    expected: {
      text: "BBOX(1.2, -3.4, 5, 6.7, -8, 9)",
      json: {
        bbox: [1.2, -3.4, 5, 6.7, -8, 9],
      },
    },
  },
  {
    name: "intersects",
    input: {
      text: "S_INTERSECTS(geometry,POINT(36.31 32.28))",
      json: {
        op: "s_intersects",
        args: [
          { property: "geometry" },
          {
            type: "Point",
            coordinates: [36.31, 32.28],
          },
        ],
      },
    },
    expected: {
      text: "S_INTERSECTS(geometry, POINT(36.31 32.28))",
      json: {
        op: "s_intersects",
        args: [
          { property: "geometry" },
          {
            type: "Point",
            coordinates: [36.31, 32.28],
          },
        ],
      },
    },
  },
];

export const testCases: TestCase[] = [
  ...PRIMITIVES,
  ...TEMPORAL,
  ...COMPARISON,
  ...FUNCTION_GROUPING,
  ...ARITHMETIC,
  ...IS_NOT_NULL,
  ...AND_OR_NOT,
  ...ADVANCED_COMPARISON,
  ...INSENSITIVE_COMPARISON,
  ...SPATIAL,
];

// This file is not a test file per se. When the file is testCases.ts, coverage is counted on it,
// but when it's testCases.test.ts, Vitest expect it to have some test.
import { describe } from "vitest";
describe.skip("Test cases is not a test file 🙈");
