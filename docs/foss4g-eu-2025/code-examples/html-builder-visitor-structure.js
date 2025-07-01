const HTMLBuilderVisitor = {
  visitLiteralExpression: (expr) => {},
  visitOperatorExpression: (expr) => {},
  visitPropertyExpression: (expr) => {},
  visitBinaryExpression: (expr) => {},
};

const builderForm = expression.accept(HTMLBuilderVisitor);
document.getElementById("builder").appendChild(builderForm);
