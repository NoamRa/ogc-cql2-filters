export const textExamples = [
  { label: "Property reference", value: "vehicle_height > (bridge_clearance- 1)" },
  { label: "Date", value: `updated >= DATE('${new Date().toISOString().split("T")[0]}')` },
  { label: "Timestamp", value: `updated > TIMESTAMP('${new Date().toISOString()}')` },
  { label: "Arithmetic", value: "4*3+2" },
  { label: "Function", value: "add(2,3,4)" },
  { label: "Null value check", value: "geometry IS NULL" },
  { label: "Not null value check", value: "geometry IS NOT NULL" },
  { label: "And, or, not (precedence)", value: "'a' AND 'b' OR NOT 'c' AND 'd'" },
  { label: "Like operator", value: "name LIKE 'Smith%'" },
  { label: "Between operator", value: "depth BETWEEN 100.0 AND 150.0" },
  { label: "In operator", value: "cityName IN ('Toronto','Frankfurt','Tokyo','New York')" },
  { label: "Not in", value: "category NOT IN (1,2,3,4)" },
  { label: "Case-insensitive comparison", value: "CASEI(road_class) IN (CASEI('Οδος'), CASEI('Straße'))" },
  { label: "Accent-insensitive comparison", value: "ACCENTI(etat_vol) = ACCENTI('débárquér')" },
];

export const JSONExamples = [
  { label: "Basic arithmetic", value: { op: "+", args: [4, 5] } },
  {
    label: "Property reference",
    value: {
      op: ">",
      args: [{ property: "vehicle_height" }, { op: "-", args: [{ property: "bridge_clearance" }, 1] }],
    },
  },
  { label: "Date", value: { op: ">=", args: [{ property: "updated" }, { date: "2024-11-27" }] } },
  { label: "Null value check", value: { op: "isNull", args: [{ property: "geometry" }] } },
  { label: "Not null value check", value: { op: "not", args: [{ op: "isNull", args: [{ property: "geometry" }] }] } },
  {
    label: "Like operator",
    value: {
      op: "like",
      args: [
        {
          property: "name",
        },
        "Smith%",
      ],
    },
  },
  {
    label: "Between operator",
    value: {
      op: "between",
      args: [
        {
          property: "depth",
        },
        100,
        150,
      ],
    },
  },
  {
    label: "In operator",
    value: {
      op: "in",
      args: [
        {
          property: "cityName",
        },
        ["Toronto", "Frankfurt", "Tokyo", "New York"],
      ],
    },
  },
  {
    label: "Not in",
    value: {
      op: "not",
      args: [
        {
          op: "in",
          args: [
            {
              property: "category",
            },
            [1, 2, 3, 4],
          ],
        },
      ],
    },
  },
  {
    label: "Case-insensitive comparison",
    value: {
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
  {
    label: "Accent-insensitive comparison",
    value: {
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
].map((example) => ({ ...example, value: JSON.stringify(example.value, null, 2) }));
