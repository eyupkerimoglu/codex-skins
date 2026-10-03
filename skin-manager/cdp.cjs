'use strict';
class Session {
  constructor(target, onEvent = () => {}) { this.target = target; this.onEvent = onEvent; this.pending = new Map(); this.serial = 0; }
  async connect() {
    this.ws = new WebSocket(this.target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.ws.close(); reject(Error('Codex connection timed out')); }, 5000);
      this.ws.onopen = () => { clearTimeout(timer); resolve(); };
      this.ws.onerror = () => { clearTimeout(timer); reject(Error('Could not connect to Codex')); };
    });
    this.ws.onmessage = event => {
      const message = JSON.parse(String(event.data));
      const call = this.pending.get(message.id);
      if (call) { clearTimeout(call.timer); this.pending.delete(message.id); message.error ? call.reject(Error(message.error.message)) : call.resolve(message.result); }
      else this.onEvent(message);
    };
    this.ws.onclose = () => { for (const call of this.pending.values()) { clearTimeout(call.timer); call.reject(Error('Codex renderer disconnected')); } this.pending.clear(); this.closed = true; };
    return this;
  }
  call(method, params = {}, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++this.serial;
      const timer = setTimeout(() => { this.pending.delete(id); reject(Error(method + ' timed out')); }, timeout);
      this.pending.set(id, {resolve, reject, timer});
      this.ws.send(JSON.stringify({id, method, params}));
    });
  }
  async evaluate(expression) {
    const value = await this.call('Runtime.evaluate', {expression, returnByValue: true, awaitPromise: true});
    if (value.exceptionDetails) throw Error(value.exceptionDetails.exception?.description || value.exceptionDetails.text);
    return value.result?.value;
  }
  close() { this.ws?.close(); }
}
async function targets() {
  const response = await fetch('http://127.0.0.1:9229/json/list', {signal: AbortSignal.timeout(2000)});
  return (await response.json()).filter(target => target.type === 'page' && target.url === 'app://-/index.html' && target.webSocketDebuggerUrl);
}
module.exports = {Session, targets};
