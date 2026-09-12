/**
 * Client-side SymPy CAS Service using Pyodide WebAssembly in a Web Worker
 * Provides exact algebraic ground truth, symbolic factoring, and solution verification.
 */

export interface SymPySolveResult {
  latex: string;
  solutions: string[];
  numeric: number[];
  count: number;
}

export interface SymPyVerifyResult {
  verified: boolean[];
  allValid: boolean;
}

class SymPyService {
  private worker: Worker | null = null;
  private pendingRequests: Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void; timeout: any }
  > = new Map();
  private reqCounter = 0;
  private isSupported: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      this.isSupported = true;
    }
  }

  private initWorker() {
    if (this.worker || !this.isSupported) return;
    try {
      this.worker = new Worker('/workers/sympyWorker.js');
      this.worker.onmessage = (e: MessageEvent) => {
        const { id, success, data, error } = e.data || {};
        if (!id) return;
        const req = this.pendingRequests.get(id);
        if (req) {
          clearTimeout(req.timeout);
          this.pendingRequests.delete(id);
          if (success) {
            req.resolve(data);
          } else {
            req.reject(new Error(error || 'Worker operation failed'));
          }
        }
      };

      this.worker.onerror = (err) => {
        // Reject all pending
        this.pendingRequests.forEach((req) => {
          clearTimeout(req.timeout);
          req.reject(err);
        });
        this.pendingRequests.clear();
      };

      this.isInitialized = true;
    } catch {
      this.worker = null;
    }
  }

  private send<T>(type: string, payload: any, timeoutMs: number = 9000): Promise<T> {
    if (!this.isSupported) {
      return Promise.reject(new Error('Web Workers not supported in current environment'));
    }

    this.initWorker();
    if (!this.worker) {
      return Promise.reject(new Error('Failed to initialize SymPy worker'));
    }

    const id = `sympy_${++this.reqCounter}_${Date.now()}`;
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`SymPy request timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      this.worker!.postMessage({ id, type, payload });
    });
  }

  /**
   * Exact symbolic solve with SymPy
   */
  public async solve(
    equation: string,
    variable: string = 'x',
    timeoutMs: number = 8000
  ): Promise<SymPySolveResult | null> {
    try {
      return await this.send<SymPySolveResult>('SOLVE', { equation, variable }, timeoutMs);
    } catch {
      return null;
    }
  }

  /**
   * Verify candidate numerical roots against exact equation
   */
  public async verify(
    equation: string,
    roots: number[],
    variable: string = 'x',
    timeoutMs: number = 5000
  ): Promise<SymPyVerifyResult | null> {
    try {
      return await this.send<SymPyVerifyResult>('VERIFY', { equation, roots, variable }, timeoutMs);
    } catch {
      return null;
    }
  }

  /**
   * Simplify expression symbolically
   */
  public async simplify(
    expression: string,
    timeoutMs: number = 5000
  ): Promise<{ latex: string; ascii: string } | null> {
    try {
      return await this.send<{ latex: string; ascii: string }>('SIMPLIFY', { expression }, timeoutMs);
    } catch {
      return null;
    }
  }
}

export const sympyService = new SymPyService();
