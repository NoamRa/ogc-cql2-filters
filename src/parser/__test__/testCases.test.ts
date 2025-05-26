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
      textForJson: "vehicle_height > bridge_clearance - 1", // correctly doesn't add parenthesis
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
  {
    name: "modulo",
    input: {
      text: "5 % 2",
      json: { op: "%", args: [5, 2] },
    },
    expected: {
      text: "5 % 2",
      json: { op: "%", args: [5, 2] },
    },
  },
  {
    name: "integer division",
    input: {
      text: "5 DIV 2",
      json: { op: "div", args: [5, 2] },
    },
    expected: {
      text: "5 DIV 2",
      json: { op: "div", args: [5, 2] },
    },
  },
  {
    name: "exponentiation",
    input: {
      text: "2 ^ 3",
      json: { op: "^", args: [2, 3] },
    },
    expected: {
      text: "2 ^ 3",
      json: { op: "^", args: [2, 3] },
    },
  },
  {
    name: "complex arithmetic expression",
    input: {
      text: "2 ^ (3 + 1) * 5 % 3",
      json: {
        op: "%",
        args: [
          {
            op: "*",
            args: [{ op: "^", args: [2, { op: "+", args: [3, 1] }] }, 5],
          },
          3,
        ],
      },
    },
    expected: {
      text: "2 ^ (3 + 1) * 5 % 3",
      json: {
        op: "%",
        args: [
          {
            op: "*",
            args: [
              {
                op: "^",
                args: [
                  2,
                  {
                    op: "+",
                    args: [3, 1],
                  },
                ],
              },
              5,
            ],
          },
          3,
        ],
      },
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
      textForJson: "3 = 2 + 1", // correctly doesn't add parenthesis
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
  {
    name: "function without args",
    input: {
      text: "add ( )",
      json: { op: "add", args: [] },
    },
    expected: { text: "add()", json: { op: "add", args: [] } },
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
  {
    name: "interval - date, date",
    input: {
      text: "INTERVAL('1969-07-16', '1969-07-24')",
      json: { interval: ["1969-07-16", "1969-07-24"] },
    },
    expected: {
      text: "INTERVAL('1969-07-16', '1969-07-24')",
      json: { interval: ["1969-07-16", "1969-07-24"] },
    },
  },
  {
    name: "interval - timestamp, timestamp",
    input: {
      text: "INTERVAL('1969-07-16T05:32:00Z', '1969-07-24T16:50:35Z')",
      json: { interval: ["1969-07-16T05:32:00Z", "1969-07-24T16:50:35Z"] },
    },
    expected: {
      text: "INTERVAL('1969-07-16T05:32:00.000Z', '1969-07-24T16:50:35.000Z')",
      json: { interval: ["1969-07-16T05:32:00.000Z", "1969-07-24T16:50:35.000Z"] },
    },
  },
  {
    name: "interval - timestamp, date",
    input: {
      text: "INTERVAL('1969-07-16T05:32:00Z', '1969-07-24')",
      json: { interval: ["1969-07-16T05:32:00Z", "1969-07-24"] },
    },
    expected: {
      text: "INTERVAL('1969-07-16T05:32:00.000Z', '1969-07-24')",
      json: { interval: ["1969-07-16T05:32:00.000Z", "1969-07-24"] },
    },
  },
  {
    name: "interval - after date",
    input: {
      text: "INTERVAL('2019-09-09', '..')",
      json: { interval: ["2019-09-09", ".."] },
    },
    expected: {
      text: "INTERVAL('2019-09-09', '..')",
      json: { interval: ["2019-09-09", ".."] },
    },
  },
  {
    name: "interval - before timestamp",
    input: {
      text: "INTERVAL('..', '1969-07-24T16:50:35Z')",
      json: { interval: ["..", "1969-07-24T16:50:35Z"] },
    },
    expected: {
      text: "INTERVAL('..', '1969-07-24T16:50:35.000Z')",
      json: { interval: ["..", "1969-07-24T16:50:35.000Z"] },
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
    name: "Point",
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
    name: "Point 3d",
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
    name: "Point position need to be calculated",
    input: {
      text: "POINT(3+4 5*height depth)",
      json: {
        type: "Point",
        coordinates: [
          {
            args: [3, 4],
            op: "+",
          },
          {
            args: [
              5,
              {
                property: "height",
              },
            ],
            op: "*",
          },
          {
            property: "depth",
          },
        ],
      },
    },
    expected: {
      text: "POINT(3 + 4 5 * height depth)",
      json: {
        type: "Point",
        coordinates: [
          {
            args: [3, 4],
            op: "+",
          },
          {
            args: [
              5,
              {
                property: "height",
              },
            ],
            op: "*",
          },
          {
            property: "depth",
          },
        ],
      },
    },
  },
  {
    name: "Bounding box",
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
    name: "Bounding box 3d",
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
];

const ADVANCED_SPATIAL: TestCase[] = [
  {
    name: "LineString",
    input: {
      text: "LINESTRING( 2 3,4 5 )",
      json: {
        type: "LineString",
        coordinates: [
          [2, 3],
          [4, 5],
        ],
      },
    },
    expected: {
      text: "LINESTRING(2 3, 4 5)",
      json: {
        type: "LineString",
        coordinates: [
          [2, 3],
          [4, 5],
        ],
      },
    },
  },
  {
    name: "Polygon - one linear ring",
    input: {
      text: `POLYGON(
              (
                43.7286 -79.2986,
                43.7311 -79.2996,
                43.7323 -79.2972,
                43.7303 -79.2930,
                43.7299 -79.2928,
                43.7286 -79.2986
              )
            )`,
      json: {
        type: "Polygon",
        coordinates: [
          [
            [43.7286, -79.2986],
            [43.7311, -79.2996],
            [43.7323, -79.2972],
            [43.7303, -79.293],
            [43.7299, -79.2928],
            [43.7286, -79.2986],
          ],
        ],
      },
    },
    expected: {
      text: `POLYGON((43.7286 -79.2986, 43.7311 -79.2996, 43.7323 -79.2972, 43.7303 -79.293, 43.7299 -79.2928, 43.7286 -79.2986))`,
      json: {
        type: "Polygon",
        coordinates: [
          [
            [43.7286, -79.2986],
            [43.7311, -79.2996],
            [43.7323, -79.2972],
            [43.7303, -79.293],
            [43.7299, -79.2928],
            [43.7286, -79.2986],
          ],
        ],
      },
    },
  },
  {
    name: "Polygon - two linear ring (hole)",
    input: {
      text: `POLYGON(
              (
                100.0 0.0,
                101.0 0.0,
                101.0 1.0,
                100.0 1.0,
                100.0 0.0
              ),
              (
                100.8 0.8,
                100.8 0.2,
                100.2 0.2,
                100.2 0.8,
                100.8 0.8
              )
            )`,
      json: {
        type: "Polygon",
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
          [
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8],
          ],
        ],
      },
    },
    expected: {
      text: `POLYGON((100 0, 101 0, 101 1, 100 1, 100 0), (100.8 0.8, 100.8 0.2, 100.2 0.2, 100.2 0.8, 100.8 0.8))`,
      json: {
        type: "Polygon",
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
          [
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8],
          ],
        ],
      },
    },
  },
  {
    name: "MultiPoint",
    input: {
      text: "MULTIPOINT(7 50,10 51)",
      json: {
        type: "MultiPoint",
        coordinates: [
          [7, 50],
          [10, 51],
        ],
      },
    },
    expected: {
      text: "MULTIPOINT(7 50, 10 51)",
      json: {
        type: "MultiPoint",
        coordinates: [
          [7, 50],
          [10, 51],
        ],
      },
    },
  },
  {
    name: "MultiLineString",
    input: {
      text: "MULTILINESTRING( (100.0 0.0,101.0 1.0),(102.0 2.0,103.0 3.0) )",
      json: {
        type: "MultiLineString",
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 1.0],
          ],
          [
            [102.0, 2.0],
            [103.0, 3.0],
          ],
        ],
      },
    },
    expected: {
      text: "MULTILINESTRING((100 0, 101 1), (102 2, 103 3))",
      json: {
        type: "MultiLineString",
        coordinates: [
          [
            [100.0, 0.0],
            [101.0, 1.0],
          ],
          [
            [102.0, 2.0],
            [103.0, 3.0],
          ],
        ],
      },
    },
  },
  {
    name: "MultiPolygon - with complex polygon",
    input: {
      text: `MULTIPOLYGON(
              (
                (102.0 2.0, 103.0 2.0, 103.0 3.0, 102.0 3.0, 102.0 2.0)
              ),
              (
                (100.0 0.0, 101.0 0.0, 101.0 1.0, 100.0 1.0, 100.0 0.0),
                (100.2 0.2, 100.2 0.8, 100.8 0.8, 100.8 0.2, 100.2 0.2)
              )
            )`,
      json: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0],
            ],
          ],
          [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0],
            ],
            [
              [100.2, 0.2],
              [100.2, 0.8],
              [100.8, 0.8],
              [100.8, 0.2],
              [100.2, 0.2],
            ],
          ],
        ],
      },
    },
    expected: {
      text: "MULTIPOLYGON(((102 2, 103 2, 103 3, 102 3, 102 2)), ((100 0, 101 0, 101 1, 100 1, 100 0), (100.2 0.2, 100.2 0.8, 100.8 0.8, 100.8 0.2, 100.2 0.2)))",
      json: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [102.0, 2.0],
              [103.0, 2.0],
              [103.0, 3.0],
              [102.0, 3.0],
              [102.0, 2.0],
            ],
          ],
          [
            [
              [100.0, 0.0],
              [101.0, 0.0],
              [101.0, 1.0],
              [100.0, 1.0],
              [100.0, 0.0],
            ],
            [
              [100.2, 0.2],
              [100.2, 0.8],
              [100.8, 0.8],
              [100.8, 0.2],
              [100.2, 0.2],
            ],
          ],
        ],
      },
    },
  },
  {
    name: "geometryCollection",
    input: {
      text: `GEOMETRYCOLLECTION(
              POINT(7.02 49.92), 
              POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))
            )`,
      json: {
        type: "GeometryCollection",
        geometries: [
          {
            type: "Point",
            coordinates: [7.02, 49.92],
          },
          {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
                [0, 0],
              ],
            ],
          },
        ],
      },
    },
    expected: {
      text: "GEOMETRYCOLLECTION(POINT(7.02 49.92), POLYGON((0 0, 10 0, 10 10, 0 10, 0 0)))",
      json: {
        type: "GeometryCollection",
        geometries: [
          {
            type: "Point",
            coordinates: [7.02, 49.92],
          },
          {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
                [0, 0],
              ],
            ],
          },
        ],
      },
    },
  },
];

const SPATIAL_FUNCTIONS: TestCase[] = [
  {
    name: "intersects - geometry property with point",
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
  {
    name: "crosses - road property with polygon",
    input: {
      text: `S_CROSSES(road,POLYGON((43.7286 -79.2986, 43.7311 -79.2996, 43.7323 -79.2972,
                                     43.7326 -79.2971, 43.7350 -79.2981, 43.7350 -79.2982,
                                     43.7352 -79.2982, 43.7357 -79.2956, 43.7337 -79.2948,
                                     43.7343 -79.2933, 43.7339 -79.2923, 43.7327 -79.2947,
                                     43.7320 -79.2942, 43.7322 -79.2937, 43.7306 -79.2930,
                                     43.7303 -79.2930, 43.7299 -79.2928, 43.7286 -79.2986)))`,
      json: {
        op: "s_crosses",
        args: [
          { property: "road" },
          {
            type: "Polygon",
            coordinates: [
              [
                [43.7286, -79.2986],
                [43.7311, -79.2996],
                [43.7323, -79.2972],
                [43.7326, -79.2971],
                [43.735, -79.2981],
                [43.735, -79.2982],
                [43.7352, -79.2982],
                [43.7357, -79.2956],
                [43.7337, -79.2948],
                [43.7343, -79.2933],
                [43.7339, -79.2923],
                [43.7327, -79.2947],
                [43.732, -79.2942],
                [43.7322, -79.2937],
                [43.7306, -79.293],
                [43.7303, -79.293],
                [43.7299, -79.2928],
                [43.7286, -79.2986],
              ],
            ],
          },
        ],
      },
    },
    expected: {
      text: "S_CROSSES(road, POLYGON((43.7286 -79.2986, 43.7311 -79.2996, 43.7323 -79.2972, 43.7326 -79.2971, 43.735 -79.2981, 43.735 -79.2982, 43.7352 -79.2982, 43.7357 -79.2956, 43.7337 -79.2948, 43.7343 -79.2933, 43.7339 -79.2923, 43.7327 -79.2947, 43.732 -79.2942, 43.7322 -79.2937, 43.7306 -79.293, 43.7303 -79.293, 43.7299 -79.2928, 43.7286 -79.2986)))",
      json: {
        op: "s_crosses",
        args: [
          { property: "road" },
          {
            type: "Polygon",
            coordinates: [
              [
                [43.7286, -79.2986],
                [43.7311, -79.2996],
                [43.7323, -79.2972],
                [43.7326, -79.2971],
                [43.735, -79.2981],
                [43.735, -79.2982],
                [43.7352, -79.2982],
                [43.7357, -79.2956],
                [43.7337, -79.2948],
                [43.7343, -79.2933],
                [43.7339, -79.2923],
                [43.7327, -79.2947],
                [43.732, -79.2942],
                [43.7322, -79.2937],
                [43.7306, -79.293],
                [43.7303, -79.293],
                [43.7299, -79.2928],
                [43.7286, -79.2986],
              ],
            ],
          },
        ],
      },
    },
  },
  {
    name: "intersects - geom property with bbox",
    input: {
      text: "S_DISJOINT(geom,BBOX(0,40,10,50))",
      json: {
        op: "s_disjoint",
        args: [{ property: "geom" }, { bbox: [0, 40, 10, 50] }],
      },
    },
    expected: {
      text: "S_DISJOINT(geom, BBOX(0, 40, 10, 50))",
      json: {
        op: "s_disjoint",
        args: [{ property: "geom" }, { bbox: [0, 40, 10, 50] }],
      },
    },
  },
  {
    name: "equals - geom property with point",
    input: {
      text: "S_EQUALS(geom,POINT(6.1300028 49.6116604))",
      json: {
        op: "s_equals",
        args: [{ property: "geom" }, { type: "Point", coordinates: [6.1300028, 49.6116604] }],
      },
    },
    expected: {
      text: "S_EQUALS(geom, POINT(6.1300028 49.6116604))",
      json: {
        op: "s_equals",
        args: [{ property: "geom" }, { type: "Point", coordinates: [6.1300028, 49.6116604] }],
      },
    },
  },
  {
    name: "overlaps - geom property with bbox",
    input: {
      text: `S_OVERLAPS(geom,BBOX(-180,-90,0,90))`,
      json: {
        op: "s_overlaps",
        args: [{ property: "geom" }, { bbox: [-180, -90, 0, 90] }],
      },
    },
    expected: {
      text: `S_OVERLAPS(geom, BBOX(-180, -90, 0, 90))`,
      json: {
        op: "s_overlaps",
        args: [{ property: "geom" }, { bbox: [-180, -90, 0, 90] }],
      },
    },
  },
  {
    name: "touches - geom property with line string",
    input: {
      text: `S_TOUCHES(
              geom, 
              LINESTRING(6.043073357781111 50.128051662794235,6.242751092156993 49.90222565367873)
            )`,
      json: {
        op: "s_touches",
        args: [
          { property: "geom" },
          {
            type: "LineString",
            coordinates: [
              [6.043073357781111, 50.128051662794235],
              [6.242751092156993, 49.90222565367873],
            ],
          },
        ],
      },
    },
    expected: {
      text: "S_TOUCHES(geom, LINESTRING(6.043073357781111 50.128051662794235, 6.242751092156993 49.90222565367873))",
      json: {
        op: "s_touches",
        args: [
          { property: "geom" },
          {
            type: "LineString",
            coordinates: [
              [6.043073357781111, 50.128051662794235],
              [6.242751092156993, 49.90222565367873],
            ],
          },
        ],
      },
    },
  },
  {
    name: "within - bbox with geom property",
    input: {
      text: `S_WITHIN(BBOX(-180,-90,0,90),geom)`,
      json: {
        op: "s_within",
        args: [{ bbox: [-180, -90, 0, 90] }, { property: "geom" }],
      },
    },
    expected: {
      text: "S_WITHIN(BBOX(-180, -90, 0, 90), geom)",
      json: {
        op: "s_within",
        args: [{ bbox: [-180, -90, 0, 90] }, { property: "geom" }],
      },
    },
  },
];

const ARRAY_FUNCTIONS: TestCase[] = [
  {
    name: "array",
    input: {
      text: "('a',TRUE,1)",
      json: ["a", true, 1],
    },
    expected: {
      text: "('a', TRUE, 1)",
      json: ["a", true, 1],
    },
  },
  {
    name: "empty array",
    input: {
      text: "()",
      json: [],
    },
    expected: {
      text: "()",
      json: [],
    },
  },
  {
    name: "nested array",
    input: {
      text: "('a',('b','c'))",
      json: ["a", ["b", "c"]],
    },
    expected: {
      text: "('a', ('b', 'c'))",
      json: ["a", ["b", "c"]],
    },
  },
  {
    name: "deeply nested arrays",
    input: {
      text: "('a', ('b', ('c', 'd')))",
      json: ["a", ["b", ["c", "d"]]],
    },
    expected: {
      text: "('a', ('b', ('c', 'd')))",
      json: ["a", ["b", ["c", "d"]]],
    },
  },
  {
    name: "array equals tags",
    input: {
      text: "A_EQUALS(tags,('foo','bar'))",
      json: {
        op: "a_equals",
        args: [
          {
            property: "tags",
          },
          ["foo", "bar"],
        ],
      },
    },
    expected: {
      text: "A_EQUALS(tags, ('foo', 'bar'))",
      json: {
        op: "a_equals",
        args: [
          {
            property: "tags",
          },
          ["foo", "bar"],
        ],
      },
    },
  },
  {
    name: "array equals values",
    input: {
      text: "A_EQUALS(values,('a',TRUE, 1))",
      json: {
        op: "a_equals",
        args: [
          {
            property: "values",
          },
          ["a", true, 1],
        ],
      },
    },
    expected: {
      text: "A_EQUALS(values, ('a', TRUE, 1))",
      json: {
        op: "a_equals",
        args: [
          {
            property: "values",
          },
          ["a", true, 1],
        ],
      },
    },
  },
  {
    name: "a_contains with property and array",
    input: {
      text: "A_CONTAINS(categories, ('sport', 'news'))",
      json: {
        op: "a_contains",
        args: [{ property: "categories" }, ["sport", "news"]],
      },
    },
    expected: {
      text: "A_CONTAINS(categories, ('sport', 'news'))",
      json: {
        op: "a_contains",
        args: [{ property: "categories" }, ["sport", "news"]],
      },
    },
  },
  {
    name: "a_containedby with array and property",
    input: {
      text: "A_CONTAINEDBY(('red', 'blue'), colors)",
      json: {
        op: "a_containedBy",
        args: [["red", "blue"], { property: "colors" }],
      },
    },
    expected: {
      text: "A_CONTAINEDBY(('red', 'blue'), colors)",
      json: {
        op: "a_containedBy",
        args: [["red", "blue"], { property: "colors" }],
      },
    },
  },
  {
    name: "a_overlaps with arrays",
    input: {
      text: "A_OVERLAPS(('a', 'b'), values)",
      json: {
        op: "a_overlaps",
        args: [["a", "b"], { property: "values" }],
      },
    },
    expected: {
      text: "A_OVERLAPS(('a', 'b'), values)",
      json: {
        op: "a_overlaps",
        args: [["a", "b"], { property: "values" }],
      },
    },
  },
  {
    name: "array with temporal values",
    input: {
      text: "(DATE('1969-07-16'), DATE('1969-07-20'), DATE('1969-07-24'))",
      json: [{ date: "1969-07-16" }, { date: "1969-07-20" }, { date: "1969-07-24" }],
    },
    expected: {
      text: "(DATE('1969-07-16'), DATE('1969-07-20'), DATE('1969-07-24'))",
      json: [{ date: "1969-07-16" }, { date: "1969-07-20" }, { date: "1969-07-24" }],
    },
  },
  {
    name: "array function with two properties",
    input: {
      text: "A_EQUALS(array1, array2)",
      json: {
        op: "a_equals",
        args: [{ property: "array1" }, { property: "array2" }],
      },
    },
    expected: {
      text: "A_EQUALS(array1, array2)",
      json: {
        op: "a_equals",
        args: [{ property: "array1" }, { property: "array2" }],
      },
    },
  },
];

export const testCases: TestCase[] = [
  PRIMITIVES,
  TEMPORAL,
  COMPARISON,
  FUNCTION_GROUPING,
  ARITHMETIC,
  IS_NOT_NULL,
  AND_OR_NOT,
  ADVANCED_COMPARISON,
  INSENSITIVE_COMPARISON,
  SPATIAL,
  ADVANCED_SPATIAL,
  SPATIAL_FUNCTIONS,
  ARRAY_FUNCTIONS,
].flat();

// This file is not a test file per se. When the file is testCases.ts, coverage is counted on it,
// but when it's testCases.test.ts, Vitest expect it to have some test.
import { describe } from "vitest";
describe.skip("Test cases is not a test file 🙈");
