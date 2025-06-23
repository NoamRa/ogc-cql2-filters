// Example code, very bad, not to use for production.
//-------------------------------------------------------

/**
 * HTML builder visitor. Each visit expression returns HTML element.
 * Handles only string / numeric literals, basic operators, properties, and binary expressions
 * Element creation are delegated to functions for brevity.
 * Keep builder top level as this is what the demo is about.
 */
const BuilderVisitor = {
  visitLiteralExpression(expr) {
    return createInputElement(expr.value, expr.type);
  },
  visitOperatorExpression(expr) {
    return createComparisonOperatorSelectElement(expr.text);
  },
  visitPropertyExpression(expr) {
    return createInputElement(expr.name, "text");
  },
  visitBinaryExpression(expr) {
    const left = expr.left.accept(BuilderVisitor);
    const op = expr.operator.accept(BuilderVisitor);
    const right = expr.right.accept(BuilderVisitor);
    return createBinaryGroupElement(left, op, right);
  },
};

import { parse, parseText } from "https://unpkg.com/cql2-filters-parser";

// #region HTML Elements
const textArea = document.getElementById("cql2-text");
const builderError = document.getElementById("text-error");
const builderContainer = document.getElementById("builder");
const outputText = document.getElementById("output-text");
const outputJSON = document.getElementById("output-json");
// #endregion

// #region HTML elements creator functions
function createInputElement(value, type, placeholder = "") {
  const input = document.createElement("input");
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  return input;
}

function createComparisonOperatorSelectElement(currentOp) {
  const select = document.createElement("select");
  select.innerHTML = `
    <optgroup label="logical">
        <option value="AND" ${currentOp === "AND" ? "selected" : ""}>and</option>
        <option value="OR" ${currentOp === "OR" ? "selected" : ""}>or</option>
    </optgroup>

    <optgroup label="comparison">
        <option value="=" ${currentOp === "=" ? "selected" : ""}>=</option>
        <option value="<>" ${currentOp === "<>" ? "selected" : ""}>≠</option>
        <option value="<" ${currentOp === "<" ? "selected" : ""}>&lt;</option>
        <option value=">" ${currentOp === ">" ? "selected" : ""}>&gt;</option>
        <option value="<=" ${currentOp === "<=" ? "selected" : ""}>≤</option>
    </optgroup>

    <optgroup label="arithmetic">
        <option value="+" ${currentOp === "+" ? "selected" : ""}>+</option>
        <option value="-" ${currentOp === "-" ? "selected" : ""}>-</option>
        <option value="*" ${currentOp === "*" ? "selected" : ""}>*</option>
        <option value="/" ${currentOp === "/" ? "selected" : ""}>/</option>
    </optgroup>
    `;
  return select;
}

function createBinaryGroupElement(left, op, right) {
  const row = document.createElement("div");
  row.className = "builder-row";
  [left, op, right].forEach((el) => row.appendChild(el));

  return row;
}
// #endregion

// #region Render loop
function clearErrors() {
  builderError.textContent = "";
}

function showError(error) {
  builderError.textContent = error.message || String(error);
}

function showResult(expr) {
  outputText.textContent = expr.toText();
  outputJSON.textContent = JSON.stringify(expr.toJSON(), null, 2);
}

function renderBuilder(expression) {
  builderContainer.innerHTML = "";
  builderContainer.appendChild(expression.accept(BuilderVisitor));
}

function handleTextAreaChange(event) {
  const { error, expression } = parse(event.target.value);
  if (error) return showError(error.message);

  clearErrors();
  renderBuilder(expression);
  showResult(expression);
}
textArea.addEventListener("input", handleTextAreaChange);
// #endregion

// init
const initText = "city='Mostar'";
textArea.value = initText;
renderBuilder(parseText(initText));
