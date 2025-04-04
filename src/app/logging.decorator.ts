export function Loggable(constructor: Function) {
  constructor.prototype.log = function(message: string) {
    console.log(`[${new Date().toISOString()}] ${this.constructor.name}: ${message}`);
  }
}
