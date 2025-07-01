const HTMLBuilderVisitor = {
  visitLiteralExpression(expr) {
    return createInputElement(expr.value, expr.type);
  },
  visitOperatorExpression(expr) {
    return createOperatorSelectElement(expr.text);
  },
  visitPropertyExpression(expr) {
    return createInputElement(expr.name, "text");
  },
  visitBinaryExpression(expr) {
    const left = expr.left.accept(BuilderVisitor);
    const op = expr.operator.accept(BuilderVisitor);
    const right = expr.right.accept(BuilderVisitor);
    return createBinaryPairElement(left, op, right);
  },
};

const builderForm = expression.accept(HTMLBuilderVisitor);
document.getElementById("builder").appendChild(builderForm);
