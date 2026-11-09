// Memory allocator for spec_ptr
let alloc_offset: usize = 1024;

export function imw_alloc(size: i32): usize {
  let ptr = alloc_offset;
  alloc_offset += (<usize>size + 7) & ~7;
  return ptr;
}

export function imw_free(ptr: usize, size: i32): void {
  // no-op for fixed small allocations
}

function mul10000_div(u: u64, d: u64): u64 {
  if (d == 0) return 0;
  let u_hi = <u64>(<u32>(u >> 32));
  let u_lo = <u64>(<u32>u);
  let v: u64 = 10000;

  let p0 = u_lo * v;
  let p1 = u_hi * v + (p0 >> 32);
  let p_lo = (p1 << 32) | (p0 & 0xFFFFFFFF);
  let p_hi = p1 >> 32;

  if (p_hi == 0) {
    return p_lo / d;
  }

  let rem_hi: u64 = 0;
  let rem_lo: u64 = 0;
  let quot: u64 = 0;

  for (let i: i32 = 127; i >= 0; i--) {
    let bit: u64 = i >= 64 ? (p_hi >> (i - 64)) & 1 : (p_lo >> i) & 1;
    rem_hi = (rem_hi << 1) | (rem_lo >> 63);
    rem_lo = (rem_lo << 1) | bit;
    if (rem_hi > 0 || rem_lo >= d) {
      if (rem_lo < d) rem_hi--;
      rem_lo -= d;
      if (i < 64) {
        quot |= (<u64>1 << i);
      }
    }
  }
  return quot;
}

export function imw_score_deterministic(truth: i64, miner: i64, spec_ptr: usize): i64 {
  let code = load<i32>(spec_ptr);
  let tolerance = load<i64>(spec_ptr + 8);

  // Unknown code is treated as Exact (Code 0)
  if (code != 1 && code != 2) {
    // Code 0 (Exact) or Code 3 (PassFail) or Unknown
    return miner == truth ? 10000 : 0;
  }

  // AbsTol (Code 1) or RelTol (Code 2)
  let diff_u: u64 = 0;
  if (miner >= truth) {
    diff_u = <u64>(miner - truth);
  } else {
    diff_u = <u64>(truth - miner);
  }

  if (diff_u == 0) {
    return 10000;
  }

  if (tolerance <= 0) {
    return 0;
  }

  let tol_u = <u64>tolerance;
  let error: u64 = 0;

  if (code == 1) {
    // AbsTol: error is abs(truth - miner)
    error = diff_u;
  } else {
    // RelTol: error is relative error in basis points (parts per 10000)
    let abs_truth_u: u64 = truth >= 0 ? <u64>truth : <u64>(-truth);
    if (abs_truth_u == 0) {
      return 0; // node never passes truth of 0, but safe guard
    }
    error = mul10000_div(diff_u, abs_truth_u);
  }

  let double_tol = tol_u * 2;
  if (error >= double_tol) {
    return 0;
  }

  // Linear decay: 10000 * (2 * tolerance - error) / (2 * tolerance)
  let numer = <u64>10000 * (double_tol - error);
  let score = numer / double_tol;

  if (score > 10000) score = 10000;
  return <i64>score;
}
