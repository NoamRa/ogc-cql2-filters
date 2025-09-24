// prettier-ignore
// start
const HTMLBuilderVisitor = {
  visitLiteralExpression(expr) { /* ... */ },
  visitOperatorExpression(expr) { /* ... */ },
  visitPropertyExpression(expr) { /* ... */ },
  visitBinaryExpression(expr) { /* ... */ },
};

const { expression } = parse("event='Geomob'");
const builderForm = expression.accept(HTMLBuilderVisitor);
document.getElementById("builder").appendChild(builderForm);
