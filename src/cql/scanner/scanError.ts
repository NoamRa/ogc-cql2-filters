export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScanError";
  }
}
