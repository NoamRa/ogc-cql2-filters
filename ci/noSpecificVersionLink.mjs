const enforcer = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow links CQL2 spec draft",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
          disallow: { type: "array", items: { type: "string" } },
        },
      },
    ],
  },
  create(context) {
    return {
      Program() {
        const sourceCode = context.sourceCode;
        const comments = sourceCode.getAllComments();

        for (const comment of comments) {
          const urls = comment.value.match(/https?:\/\/[^\s]+/g) || [];

          for (const url of urls) {
            if (url.startsWith("https://docs.ogc.org")) {
              context.report({
                node: comment,
                message: `Links to specific version of the spec are not allowed.`,
              });
            }
          }
        }
      },
    };
  },
};

export default { rules: { "no-specific-version-link": enforcer } };
