type Operator = any; // TODO
type Arguments = any[]; // TODO

export default class Expression {
  op: Operator;
  args: Arguments;

  constructor(op: Operator, args: Arguments) {
    this.op = op;
    this.args = args;
  }

  toJSON() {
    return {
      op: this.op,
      args: this.args,
    };
  }

  toString() {
    return `${this.op}(${this.args.join(", ")})`;
  }
}
