// Inlined WebAssembly Module for Praman Desk Comparator
// 651 bytes compiled binary inlined as 868 Base64 characters
// Zero filesystem dependencies, guaranteed serverless and edge portability

export const COMPARATOR_WASM_BASE64 = 'AGFzbQEAAAABGARgAX8Bf2ACf38AYAJ+fgF+YAN+fn8BfgMFBAABAgMEBQFwAQEBBQMBAAEGBwF/AUGACAsHOwQJaW13X2FsbG9jAAAIaW13X2ZyZWUAARdpbXdfc2NvcmVfZGV0ZXJtaW5pc3RpYwADBm1lbW9yeQIACQYBAEEBCwAKhQQEGwEBfyMAIQEjACAAQQdqQQdBf3NxaiQAIAEPCwMAAQuBAgILfgF/IAFCAFEEQEIADwsgAEIgiKetIQIgAKetIQNCkM4AIQQgAyAEfiEFIAIgBH4gBUIgiHwhBiAGQiCGIAVC/////w+DhCEHIAZCIIghCCAIQgBRBEAgByABgA8LQgAhCUIAIQpCACELQf8AIQ0DQCANQQBOBEAgDUHAAE4EfiAIIA1BwABrrIhCAYMFIAcgDayIQgGDCyEMIAlCAYYgCkI/iIQhCSAKQgGGIAyEIQogCUIAVgR/QQEFIAogAVoLBEAgCiABVARAIAlCAX0hCQsgCiABfSEKIA1BwABOBEBCfw8LIAtCASANrIaEIQsLIA1BAWshDQwBCwsgCw8L3wECAX8IfiACKAIAIQMgAkEIaikDACEEIANBAUcEfyADQQJHBUEACwRAIAEgAFEEfkKQzgAFQgALDwtCACEFIAEgAFkEQCABIAB9IQUFIAAgAX0hBQsgBUIAUQRAQpDOAA8LIARCAFcEQEIADwsgBCEGQgAhByADQQFGBEAgBSEHBSAAQgBZBH4gAAVCACAAfQshCCAIQgBRBEBCAA8LIAUgCBACIQcLIAZCAn4hCSAHIAlaBEBCAA8LQpDOACAJIAd9fiEKIAogCYAhCyALQpDOAFYEQEKQzgAhCwsgCw8L';

let cachedInstance = null;

export async function getWasmInstance() {
  if (cachedInstance) {
    return cachedInstance;
  }

  const wasmBinary = typeof Buffer !== 'undefined'
    ? Buffer.from(COMPARATOR_WASM_BASE64, 'base64')
    : Uint8Array.from(atob(COMPARATOR_WASM_BASE64), c => c.charCodeAt(0));

  const wasmModule = await WebAssembly.instantiate(wasmBinary, {});
  const { imw_alloc, imw_free, imw_score_deterministic, memory } = wasmModule.instance.exports;

  const specPtr = imw_alloc(16);
  const view = new DataView(memory.buffer);

  function scoreDeterministic(truth, miner, code = 2, tolerance = 500) {
    // code: 0 = Exact, 1 = AbsTol, 2 = RelTol, 3 = PassFail
    // tolerance: e.g. 500 = 500 basis points (5.00%)
    view.setInt32(specPtr, code, true);
    view.setInt32(specPtr + 4, 0, true);
    view.setBigInt64(specPtr + 8, BigInt(tolerance), true);
    return Number(imw_score_deterministic(BigInt(truth), BigInt(miner), specPtr));
  }

  cachedInstance = {
    instance: wasmModule.instance,
    imw_alloc,
    imw_free,
    imw_score_deterministic,
    memory,
    specPtr,
    view,
    scoreDeterministic
  };

  return cachedInstance;
}
