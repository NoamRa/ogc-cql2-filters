// prettier-ignore
// start
const HTMLBuilderVisitor = {
  visitLiteralExpression(expr) { /* ToDo */ },
  visitOperatorExpression(expr) { /* ToDo */ },
  visitPropertyExpression(expr) { /* ToDo */ },
  visitBinaryExpression(expr) { /* ToDo */ },
};

const { expression } = parse("city='Mostar'");
const builderForm = expression.accept(HTMLBuilderVisitor);
document.getElementById("builder").appendChild(builderForm);
