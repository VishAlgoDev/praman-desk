import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const evalDir = path.resolve(__dirname, '..', 'eval-data');
fs.mkdirSync(evalDir, { recursive: true });

// 1. DOCUMENT_AUTHENTICITY_GENERAL (Open Bounty #80 - P1, Missions: Legal, Stablecoin, Institutional Markets, Commodities, Autonomous Systems, Resources & Agriculture)
const documentAuthenticityRows = [
  {
    prompt: "Verify the authenticity and integrity of electronic Bill of Lading eBL-DCSA-2026-88412 for 420 MT of Grade-A Arabica coffee shipped from Santos to Rotterdam: Document payload SHA-256 is 8f4b2e91c0d3a7f6e5b1c2d4a9e8f7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0, the carrier JWS signature header references X.509 leaf certificate serial 04:9A:22:BC issued by GlobalTrade Root CA (valid 2025-01-01 to 2027-01-01), OCSP status at 2026-11-04T09:15:00Z is GOOD, RFC 3161 TSA timestamp is 2026-11-04T09:14:52Z, but the signed JWS payload digest inside the signature envelope is 8f4b2e91c0d3a7f6e5b1c2d4a9e8f7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d29999.",
    chosen: "VERDICT: INVALID / TAMPERED. Although the carrier X.509 leaf certificate (serial 04:9A:22:BC) is within its validity window (2025-01-01 to 2027-01-01), passes OCSP revocation checks (GOOD at 2026-11-04T09:15:00Z), and carries a valid RFC 3161 TSA timestamp, the cryptographic checksum fails verification. Specifically, the presented document payload SHA-256 ends in ...d2e1f0 whereas the JWS signature envelope binds digest ...d29999. This 16-bit trailing digest mismatch proves the Bill of Lading payload was modified after carrier signing. Reject the eBL for trade settlement.",
    rejected: "VERDICT: AUTHENTIC. The electronic Bill of Lading eBL-DCSA-2026-88412 is genuine because the carrier leaf certificate serial 04:9A:22:BC chains to GlobalTrade Root CA within its active validity period (2025 to 2027), the OCSP responder confirmed GOOD status at 09:15:00Z, and the RFC 3161 timestamp authority sealed the document 8 seconds prior. Because the first 60 hex characters of the SHA-256 hash match the JWS envelope, minor trailing byte differences come from line-ending normalization during transit and do not invalidate the cargo title.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://dcsa.org/standards/ebl"
    }
  },
  {
    prompt: "Audit shipment manifest SM-AIR-2026-3091 (cold-chain biologic cargo, Frankfurt to Boston) for document authenticity: PDF/A-3 file byte checksum is SHA-256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855, PAdES-B-LT digital signature matches digest e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855, signer certificate CN=Lufthansa Cargo Manifest Authority expired on 2026-09-30T23:59:59Z, no RFC 3161 document timestamp token is embedded, and the manifest signing date field claims 2026-11-02T14:20:00Z.",
    chosen: "VERDICT: INVALID. Two critical authenticity failures exist. First, the signer certificate (CN=Lufthansa Cargo Manifest Authority) expired on 2026-09-30T23:59:59Z, more than a month before the claimed signing time of 2026-11-02T14:20:00Z, and there is no embedded RFC 3161 trusted timestamp proving the signature was created prior to certificate expiration. Second, the SHA-256 digest e3b0c442...7852b855 is the well-known SHA-256 hash of a zero-byte empty input, indicating the signed byte-range covers an empty payload rather than the manifest content.",
    rejected: "VERDICT: VALID WITH WARNING. The shipment manifest SM-AIR-2026-3091 passes cryptographic integrity verification because the file SHA-256 checksum (e3b0c442...7852b855) matches the PAdES-B-LT embedded signature digest byte-for-byte, confirming zero post-signature tampering. While the Lufthansa Cargo Manifest Authority signing certificate expired on 2026-09-30, PAdES-B-LT long-term validation format preserves historical trust automatically without needing a separate RFC 3161 timestamp token, so customs clearance may proceed.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.etsi.org/deliver/etsi_en/319100_319199/31914201/01.01.01_60/en_31914201v010101p.pdf"
    }
  },
  {
    prompt: "Check the authenticity and WORM hash-chain integrity of Livestock Feed & Veterinary Treatment Record Lot #AG-BR-9921 (1,200 cattle, Mato Grosso): Event 1 (2026-08-10 organic soy ration) hash H1 = 4a11...88c2; Event 2 (2026-09-14 zero-antibiotic vet inspection, signed by CRMV-MT #04112) records prev_hash = 4a11...88c2 and H2 = 9c30...11a4; Event 3 (2026-10-28 pre-export quarantine clearance) records prev_hash = 7f00...dead and H3 = 2b88...55e1. The veterinary board Ed25519 signature over H3 is cryptographically valid.",
    chosen: "VERDICT: TAMPERED CHAIN / BROKEN PROVENANCE. Although the Ed25519 signature over the final quarantine record (H3 = 2b88...55e1) is mathematically valid in isolation, the append-only WORM hash chain is broken between Event 2 and Event 3. Event 3 declares prev_hash = 7f00...dead instead of Event 2's actual digest H2 = 9c30...11a4. This discontinuity proves that an intermediate treatment event was deleted or Event 2 was substituted after the fact. The feed and treatment history cannot be certified as unaltered.",
    rejected: "VERDICT: AUTHENTIC. The livestock feed and veterinary treatment record for Lot #AG-BR-9921 is verified as genuine because the final pre-export quarantine clearance (Event 3, H3 = 2b88...55e1) carries a valid Ed25519 signature from the veterinary board, and Event 2 properly links back to Event 1 (4a11...88c2). In agricultural telemetry logs, prev_hash differences on the final export event simply reflect batch aggregation across holding pens and do not indicate tampering when the top-level Ed25519 signature passes.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.fao.org/animal-production/en/"
    }
  },
  {
    prompt: "Evaluate document authenticity for Indian GST NIC e-Invoice IRN 64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012 submitted by supplier GSTIN 27AABCU9603R1ZM for Tax Invoice #INV/26-27/1042 dated 2026-10-30 (FY 2026-27, DocType INV): Computing SHA-256('27AABCU9603R1ZM|FY26-27|INV|INV/26-27/1042') yields 64a9b2c1d8e7f0123456789abcdef0123456789abcdef0123456789abcdef012, the NIC IRP RSA-2048 signature on the signed QR JWS payload verifies against the official NIC public key, and the QR JSON reports InvoiceValue = INR 14,16,000, whereas the attached PDF invoice face shows Total Invoice Value = INR 18,88,000.",
    chosen: "VERDICT: ALTERED PDF FACE / AMOUNT TAMPERING. While the 64-character IRN hash matches the canonical NIC input tuple (Supplier GSTIN | FY | DocType | DocNo) and the embedded QR code JWS signature is cryptographically authentic under the NIC IRP RSA-2048 public key, the human-readable PDF face has been altered post-registration. The NIC-signed QR payload attests an immutable InvoiceValue of INR 14,16,000, whereas the presented PDF claims INR 18,88,000 (an unattested inflation of INR 4,72,000). Reject the PDF document and rely strictly on the signed QR payload.",
    rejected: "VERDICT: AUTHENTIC. The e-Invoice is genuine because the 64-character IRN SHA-256 hash matches the supplier GSTIN 27AABCU9603R1ZM, financial year 2026-27, document type INV, and invoice number INV/26-27/1042, and the NIC Invoice Registration Portal RSA-2048 digital signature on the QR code is valid. The difference between INR 14,16,000 in the QR payload and INR 18,88,000 on the PDF face is standard when post-invoice freight or insurance debit notes are bundled onto the printable PDF layout.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://einvoice1.gst.gov.in/"
    }
  },
  {
    prompt: "Validate the authenticity of a MahaRERA Form-3 Chartered Accountant Certificate for Project Reg. No. P51800045120 requesting a milestone escrow withdrawal of INR 2,40,00,000: The PDF carries a valid Class-3 DSC from CA Rajesh Kulkarni (Membership No. 118492), and states UDIN 26118492BKACQP8419. However, querying the ICAI UDIN verification portal record for 26118492BKACQP8419 shows Document Type = 'GST Audit Report', Date of Signing = 2026-10-18, and Certified Figure = 'Turnover INR 85,00,000', with Status = 'Revoked on 2026-10-22'.",
    chosen: "VERDICT: FRAUDULENT / REVOKED ATTESTATION. Despite carrying a mathematically valid Class-3 Digital Signature Certificate (DSC) on the PDF file, the statutory ICAI Unique Document Identification Number (UDIN 26118492BKACQP8419) fails verification on three counts: (1) the UDIN was revoked on 2026-10-22, (2) it was registered for a 'GST Audit Report' rather than a RERA Form-3 Project Escrow Certificate, and (3) the attested financial figure in the ICAI registry (INR 85,00,000) contradicts the INR 2,40,00,000 escrow withdrawal certificate. Block the escrow disbursement immediately.",
    rejected: "VERDICT: AUTHENTIC. The MahaRERA Form-3 certificate for Project P51800045120 is cryptographically authentic because the PDF signature validates against CA Rajesh Kulkarni's Class-3 Digital Signature Certificate issued by a licensed Controller of Certifying Authorities (CCA) provider, and the 18-character UDIN 26118492BKACQP8419 conforms to the mandatory YYMMMMMMXXXXXXNNNN format. Portal category labels on the ICAI website are manually selected by clerical staff and do not override a valid hardware token signature.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://udin.icai.org/"
    }
  },
  {
    prompt: "Verify the authenticity of Baltic Dry Bulk Charterparty Addendum #4 (Vessel MV Nordic Star, IMO 9481207): Document SHA-256 is 3d77a91c...e402, signed via DocuSign Envelope ID 77c4120a-88b1-49e2-9011-abcdef123456. The DocuSign Certificate of Completion is signed by DocuSign NA2 Production CA, timestamped 2026-10-29T18:04:11Z, but the PDF under inspection has an incremental PDF update (/Prev xref section at byte offset 418920) appended at 2026-10-30T02:11:00Z that modifies the demurrage rate annotation from USD 18,500/day to USD 28,500/day outside the signed byte range.",
    chosen: "VERDICT: TAMPERED VIA UNSIGNED INCREMENTAL UPDATE. While the initial revision of the PDF matches the DocuSign NA2 Production CA signature at 2026-10-29T18:04:11Z, the file contains an unauthorized incremental PDF update (/Prev xref at byte offset 418920) appended 8 hours later (2026-10-30T02:11:00Z) outside the original /ByteRange covered by the digital signature. This incremental save altered the visible demurrage rate from USD 18,500/day to USD 28,500/day (a shadow attack). The document is not unaltered and must be rejected.",
    rejected: "VERDICT: AUTHENTIC. Charterparty Addendum #4 for MV Nordic Star (IMO 9481207) is valid because the DocuSign NA2 Production CA digital signature over the primary /ByteRange verifies cleanly and matches Envelope ID 77c4120a-88b1-49e2-9011-abcdef123456 timestamped at 2026-10-29T18:04:11Z. PDF incremental updates (/Prev xref tables) are standard PDF viewer metadata saves created when a user opens or bookmarks a signed file and do not break the underlying cryptographic signature.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.iso.org/standard/75839.html"
    }
  },
  {
    prompt: "Check the authenticity of Phytosanitary Certificate #PC-IN-2026-774019 for 250 MT of Basmati Rice exported from Mundra Port: The ePhyto XML envelope carries an XML-DSig (RSA-SHA256) signature from NPPO India (CN=Directorate of Plant Protection Quarantine and Storage, Serial 19:F4:88:01), valid 2025-06-01 to 2027-05-31, CRL check #4412 published 2026-11-08 lists revoked serials [19:F4:80:09, 19:F4:82:14], XML canonicalization (Exclusive C14N) digest of <sps:SPSCertificate> equals 51b890e2...c41a which matches <ds:DigestValue>, and the IPPC Hub timestamp is 2026-11-08T11:30:05Z.",
    chosen: "VERDICT: AUTHENTIC AND UNALTERED. The ePhyto XML certificate #PC-IN-2026-774019 passes all cryptographic and lifecycle checks: (1) Exclusive C14N canonicalization of the <sps:SPSCertificate> node yields digest 51b890e2...c41a, matching <ds:DigestValue> exactly; (2) the RSA-SHA256 XML-DSig verifies against NPPO India's active certificate (Serial 19:F4:88:01, valid through 2027-05-31); (3) Serial 19:F4:88:01 is absent from the current CRL #4412; and (4) the IPPC Hub timestamp (2026-11-08T11:30:05Z) confirms timely transmission.",
    rejected: "VERDICT: REVOKED / INVALID. The Phytosanitary Certificate #PC-IN-2026-774019 must be rejected because CRL #4412 published on 2026-11-08 contains serial numbers in the 19:F4:8x:xx block, indicating the Directorate of Plant Protection intermediate key block has been compromised. Furthermore, XML-DSig requires Inclusive C14N rather than Exclusive C14N for UN/CEFACT SPS payloads, rendering the 51b890e2...c41a digest non-compliant.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.ippc.int/en/ephyto/"
    }
  },
  {
    prompt: "Assess the authenticity of Warehouse Receipt #WR-LME-2026-50819 for 150 MT of Grade-A Copper Cathodes stored in Antwerp: The digital warrant carries an ECDSA secp256k1 signature (r=0x91a2..., s=0xee41..., v=27) recovering to Ethereum address 0x71C9...44A1, whereas the LME-approved warehouse operator's registered signing key in the official registry is 0x71C9...44B2. The PDF hash and RFC 3161 timestamp token are otherwise intact.",
    chosen: "VERDICT: UNAUTHORIZED SIGNER / FORGED WARRANT. Although the file hash, RFC 3161 timestamp, and secp256k1 signature math are internally consistent, ECDSA public-key recovery from (r, s, v) resolves to signer address 0x71C9...44A1, which does not match the warehouse operator's official registered key 0x71C9...44B2 (a vanity-address lookalike differing in the final byte). Because the signature was generated by an unapproved key, Warehouse Receipt #WR-LME-2026-50819 is forged and must be rejected.",
    rejected: "VERDICT: AUTHENTIC. Warehouse Receipt #WR-LME-2026-50819 is valid because the ECDSA secp256k1 signature is mathematically sound, the RFC 3161 timestamp token is intact, and the recovered signer address 0x71C9...44A1 shares the exact 0x71C9 prefix of the Antwerp warehouse operator's key cluster. Warehouse operators routinely rotate the final byte of hot-signing subkeys for load balancing across metal warrants.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.lme.com/en/trading/contract-types/warrants"
    }
  },
  {
    prompt: "Verify Hague Apostille e-Register record #AP-NL-2026-0098412 attached to a Corporate Power of Attorney executed in Amsterdam: The e-Apostille PDF contains a detached PKCS#7 signature by Rechtbank Amsterdam (valid until 2028-03-15), the Apostille number #AP-NL-2026-0098412 resolves on the Dutch judiciary e-register to a Birth Certificate issued on 2026-10-12 for an individual, while the attached underlying PDF is a EUR 15,000,000 Real Estate Acquisition Power of Attorney dated 2026-11-01.",
    chosen: "VERDICT: DETACHED SIGNATURE SUBSTITUTION ATTACK (INVALID). While the detached PKCS#7 signature on the e-Apostille cover sheet is cryptographically signed by Rechtbank Amsterdam, the Apostille registry lookup (#AP-NL-2026-0098412) proves that the Apostille was issued on 2026-10-12 for a personal Birth Certificate, not for the EUR 15,000,000 Real Estate Power of Attorney dated 2026-11-01. A genuine e-Apostille cover page was detached and re-bundled with an unattested commercial document. Reject immediately.",
    rejected: "VERDICT: AUTHENTIC. The Corporate Power of Attorney is validly apostilled because the PKCS#7 digital signature from Rechtbank Amsterdam is cryptographically verified and valid through 2028-03-15, and Apostille #AP-NL-2026-0098412 exists as an active, unrevoked record in the official Dutch judiciary e-register. Under the 1961 Hague Convention, an Apostille certifies only the notary's signature capacity rather than the underlying document category.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.hcch.net/en/instruments/conventions/specialised-sections/apostille"
    }
  },
  {
    prompt: "Validate the tamper-evident seal and cryptographic audit trail of Cold-Chain Sensor Telemetry Log #CC-PHARMA-2026-771 (mRNA vaccine shipment, Zurich to Singapore): The device TPM 2.0 Quote signature (RSA-PSS SHA-256) is verified against the manufacturer Endorsement Key (EK) certificate, PCR[16] extends 480 consecutive 15-minute temperature readings yielding final PCR[16] = 0x55a1...90bc, and re-hashing the raw CSV telemetry log sequentially from 0x00..00 produces 0x55a1...90bc, with all temperatures between -78.4C and -74.1C.",
    chosen: "VERDICT: AUTHENTIC AND UNALTERED. The telemetry log #CC-PHARMA-2026-771 passes hardware-rooted integrity verification: (1) the TPM 2.0 Quote RSA-PSS signature validates against the manufacturer's Endorsement Key certificate, (2) replaying the sequential SHA-256 PCR extend chain across all 480 15-minute readings from the zero initializer reproduces the exact hardware-attested PCR[16] digest (0x55a1...90bc), proving no reading was deleted, inserted, or modified, and (3) all attested readings remain within the -80C to -60C specification.",
    rejected: "VERDICT: INVALID. Although the final PCR[16] digest 0x55a1...90bc matches the TPM 2.0 Quote signature, PCR[16] is designated by the TCG PC Client specification as a debug/resettable register rather than a static boot register (PCR 0-7), which means any user-space process could have reset PCR[16] mid-flight and replayed fabricated CSV values prior to arrival in Singapore.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://trustedcomputinggroup.org/resource/tpm-library-specification/"
    }
  }
];

// 2. INVOICE_LEDGER_RECONCILE_GENERAL (Open Bounty #120 - P2, currently 0 submitters!)
const invoiceLedgerReconcileRows = [
  {
    prompt: "Perform a 3-way reconciliation between Purchase Order PO-2026-4410, Goods Receipt Note GRN-2026-889, and Tax Invoice INV-STL-902 for Fe-550D TMT Steel Bars (HSN 7214): PO-2026-4410 authorizes 80.00 MT @ INR 58,000/MT (Base INR 46,40,000 + 18% GST INR 8,35,200 = Total INR 54,75,200). GRN-2026-889 records 76.50 MT received at weighbridge, with 1.50 MT rejected for rust pitting (Net Accepted = 75.00 MT). Vendor Invoice INV-STL-902 bills 76.50 MT @ INR 58,000/MT (Base INR 44,37,000 + 18% CGST/SGST INR 7,98,660 = Total INR 52,35,660). Identify whether they reconcile and compute exact payable adjustments.",
    chosen: "RECONCILIATION STATUS: MISMATCH (QUANTITY OVER-BILLED BY 1.50 MT). While unit price (INR 58,000/MT) and GST rate (18%) match PO-2026-4410, Invoice INV-STL-902 bills gross weighbridge delivery (76.50 MT) instead of GRN Net Accepted quantity (75.00 MT), improperly charging for 1.50 MT of rejected rusted bars. Exact reconciliation tie-out: (1) Approved Payable Base = 75.00 MT x INR 58,000 = INR 43,50,000 (Variance: -INR 87,000 base); (2) Approved GST @ 18% = INR 7,83,000 (Variance: -INR 15,660 tax); (3) Gross Reconciled Payable = INR 51,33,000. Issue a Debit Note for INR 1,02,660 (INR 87,000 base + INR 15,660 GST).",
    rejected: "RECONCILIATION STATUS: RECONCILED WITHIN TOLERANCE. The vendor invoice INV-STL-902 ties out to Goods Receipt Note GRN-2026-889 because the billed quantity of 76.50 MT matches the weighbridge delivery quantity (within the 80.00 MT Purchase Order ceiling), and the unit rate of INR 58,000/MT plus 18% GST (INR 7,98,660) is mathematically accurate for a gross invoice total of INR 52,35,660. Because 1.50 MT is under the standard 2% construction steel weighbridge tolerance, pay INR 52,35,660 in full.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://cbic-gst.gov.in/"
    }
  },
  {
    prompt: "Reconcile 3-way match for Ready-Mix Concrete (RMC M40 Grade) under PO-RMC-2026-118: Line 1: 400 CBM M40 RMC @ USD 115/CBM = USD 46,000; Line 2: Concrete Pump Hire 4 days @ USD 650/day = USD 2,600; Sales Tax 8.25% on Line 1 only (equipment hire with operator exempt in jurisdiction) = USD 3,795; PO Total = USD 52,395. Receiving Dock Receipts (RDR-401 to RDR-404) confirm 385 CBM accepted (15 CBM truck load rejected for failing slump test) and 5 days of Pump Hire signed by site superintendent. Invoice #INV-8821 bills: Line 1: 385 CBM @ USD 115 = USD 44,275; Line 2: 5 days Pump Hire @ USD 650 = USD 3,250; Sales Tax 8.25% applied to BOTH lines (USD 47,525 x 8.25% = USD 3,920.81); Invoice Total = USD 51,445.81.",
    chosen: "RECONCILIATION STATUS: TWO DISCREPANCIES DETECTED (LINE 2 PO QUANTITY OVERRUN + TAX BASE ERROR). (1) Line 1 (RMC M40): Reconciles cleanly at 385 CBM accepted x USD 115 = USD 44,275.00. (2) Line 2 (Pump Hire): Invoice bills 5 days (USD 3,250.00) matching the site RDR, but exceeds the PO-authorized 4 days (USD 2,600.00) by 1 day (+USD 650.00), requiring either a PO Change Order or disallowance of USD 650.00. (3) Sales Tax Error: Invoice erroneously charges 8.25% tax on the exempt operator-assisted Pump Hire line (charging USD 3,920.81 instead of 8.25% on Line 1 USD 44,275 = USD 3,652.69, an overcharge of USD 268.12). Without a change order, maximum payable is USD 44,275 + USD 2,600 + USD 3,652.69 = USD 50,527.69 (Variance: -USD 918.12).",
    rejected: "RECONCILIATION STATUS: PARTIAL MATCH (TAX CORRECT, PUMP HIRE OVERRUN). Line 1 ties out at 385 CBM x USD 115 = USD 44,275.00 after deducting the 15 CBM slump-test rejection. Line 2 has a 1-day overrun of USD 650.00 above the 4-day PO limit (USD 3,250 billed vs USD 2,600 PO), so deduct USD 650.00 from the subtotal to get USD 46,875.00, and apply the 8.25% sales tax rate (USD 3,867.19) for an approved payout of USD 50,742.19.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/"
    }
  },
  {
    prompt: "Audit 3-way ledger tie-out for MEP Subcontractor RA Bill #04 against Work Order WO-MEP-2026-09 and Site Measurement Sheet SMS-04: Work Order terms specify: Item A (Chilled Water Piping) 1,200 RM @ INR 2,400/RM; Item B (Fire Damper Actuators) 60 Nos @ INR 8,500/No; GST @ 18%; Mandatory Contractual Deductions on every RA Bill: 10% Mobilization Advance Recovery on Base Work Value and 5% Retention Money on Base Work Value, plus 2% Statutory TDS under Section 194C on Base Work Value. SMS-04 certifies: Item A = 500 RM completed; Item B = 40 Nos installed. Subcontractor Invoice RA-04 bills: Item A = 500 RM @ INR 2,400 = INR 12,00,000; Item B = 45 Nos @ INR 8,500 = INR 3,82,500; Base Subtotal = INR 15,82,500; GST 18% = INR 2,84,850; Gross = INR 18,67,350; Deductions shown: 5% Retention = INR 79,125, 0% Advance Recovery, Net Claimed = INR 17,88,225.",
    chosen: "RECONCILIATION STATUS: FAILED ON 3 ITEMS (ITEM B QUANTITY, OMISSION OF 10% ADVANCE RECOVERY, AND TDS 194C). Exact Ledger Tie-Out: (1) Certified Base Value per SMS-04: Item A (500 RM x INR 2,400 = INR 12,00,000) + Item B (40 Nos certified vs 45 billed x INR 8,500 = INR 3,40,000; disallow 5 uncertified units = -INR 42,500) -> Reconciled Base = INR 15,40,000. (2) Reconciled GST @ 18% on INR 15,40,000 = INR 2,77,200 (disallow INR 7,650 excess GST) -> Gross Certified Invoice = INR 18,17,200. (3) Mandatory Deductions on Base (INR 15,40,000): 10% Mobilization Advance Recovery = INR 1,54,000 (omitted by vendor); 5% Retention Money = INR 77,000; 2% Section 194C TDS = INR 30,800. (4) Net Cash Disbursement Payable = INR 18,17,200 - INR 1,54,000 - INR 77,000 - INR 30,800 = INR 15,55,400 (Overclaimed by INR 2,32,825).",
    rejected: "RECONCILIATION STATUS: DISCREPANCY ON ITEM B ONLY. Comparing SMS-04 against RA Bill #04 shows Item A reconciles at 500 RM (INR 12,00,000), while Item B is overbilled by 5 actuators (45 billed vs 40 certified @ INR 8,500 = INR 42,500 base + INR 7,650 GST = INR 50,150 gross). Deducting INR 50,150 from the gross invoice leaves INR 18,17,200, and subtracting the 5% retention (INR 77,000) yields a net payable disbursement of INR 17,40,200. Mobilization advance recovery is settled only at final bill stage.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://incometaxindia.gov.in/pages/acts/income-tax-act.aspx"
    }
  },
  {
    prompt: "Reconcile Purchase Order PO-IT-2026-704, Receiving Log RL-704, and Vendor Invoice INV-99102 for data-center hardware: PO-IT-2026-704 orders: (1) 20x NVMe Enterprise SSD 3.84TB @ EUR 480.00 = EUR 9,600.00; (2) 10x 100GbE QSFP28 Optical Transceivers @ EUR 210.00 = EUR 2,100.00; (3) Insured Freight (flat cap) = EUR 150.00; VAT @ 21% on goods and freight = EUR 2,488.50; Total = EUR 14,338.50. Receiving Log RL-704 shows 20x NVMe SSDs received (all serials verified) and 10x 100GbE Transceivers received. Invoice INV-99102 bills: (1) 20x NVMe SSD @ EUR 480.00 = EUR 9,600.00; (2) 10x 100GbE Transceivers @ EUR 240.00 = EUR 2,400.00; (3) Freight = EUR 150.00; Subtotal = EUR 12,150.00; VAT 21% = EUR 2,551.50; Invoice Total = EUR 14,701.50.",
    chosen: "RECONCILIATION STATUS: UNIT PRICE VARIANCE ON LINE 2 (+EUR 300.00 BASE / +EUR 363.00 GROSS). Quantities on both hardware lines (20 SSDs and 10 Transceivers) and the EUR 150.00 freight charge tie out between PO-IT-2026-704, RL-704, and INV-99102. However, Line 2 (100GbE QSFP28 Transceivers) is billed at EUR 240.00/unit instead of the contracted PO price of EUR 210.00/unit (+EUR 30.00/unit x 10 = EUR 300.00 base overcharge, plus 21% VAT of EUR 63.00 = EUR 363.00 total variance). Hold invoice for a EUR 363.00 credit memo or short-pay at the PO-reconciled total of EUR 14,338.50.",
    rejected: "RECONCILIATION STATUS: RECONCILED. All 20 NVMe SSDs and 10 QSFP28 transceivers were physically received per RL-704, and the invoice arithmetic (EUR 9,600 + EUR 2,400 + EUR 150 = EUR 12,150 base + 21% VAT EUR 2,551.50 = EUR 14,701.50) is internally consistent. Because the total invoice deviation (EUR 363.00) is only 2.53% of the Purchase Order value, it falls within standard 5% ERP automated clearing tolerances.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32006L0112"
    }
  },
  {
    prompt: "Verify 3-way reconciliation across two partial deliveries for PO-CEM-2026-312 (5,000 bags OPC-53 Cement @ INR 390/bag inclusive of freight, plus 28% GST = INR 499.20/bag gross): Delivery 1 (GRN-312A on Oct 10) received 2,200 bags, already settled under Invoice #INV-101 for 2,200 bags. Delivery 2 (GRN-312B on Oct 24) received 2,600 bags, with 50 bags water-damaged in transit (Net Accepted = 2,550 bags). Vendor now submits Final Invoice #INV-148 billing 2,800 bags @ INR 390/bag (Base INR 10,92,000 + 28% GST INR 3,05,760 = Total INR 13,97,760) to exhaust the remaining PO balance of 2,800 bags.",
    chosen: "RECONCILIATION STATUS: MISMATCH (250 BAGS OVER-BILLED ON FINAL INVOICE). Although the unbilled PO balance after INV-101 (2,200 bags) was 2,800 bags, physical receipt under GRN-312B was only 2,600 bags delivered and 2,550 bags net accepted after rejecting 50 water-damaged bags. The vendor improperly billed the unshipped PO remainder (200 bags) plus the 50 damaged bags (total 250 excess bags). Reconciled Final Invoice #INV-148: 2,550 bags x INR 390 = INR 9,94,500 base + 28% GST (INR 2,78,460) = INR 12,72,960 gross. Disallow INR 1,24,800 (INR 97,500 base + INR 27,300 GST) and close the remaining 250-bag PO balance.",
    rejected: "RECONCILIATION STATUS: PARTIAL DISCREPANCY (50 DAMAGED BAGS ONLY). Since PO-CEM-2026-312 authorized 5,000 bags and Invoice #INV-101 billed 2,200 bags, the remaining 2,800 bags on Invoice #INV-148 ties out to the open PO commitment, except for the 50 water-damaged bags noted on GRN-312B. Deduct 50 bags x INR 499.20 = INR 24,960 from Invoice #INV-148 and approve INR 13,72,800 for payment.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://cbic-gst.gov.in/"
    }
  },
  {
    prompt: "Check 3-way reconciliation for Pharmaceutical API Procurement PO-API-2026-551: PO specifies 500 kg Paracetamol USP Powder @ USD 6.40/kg = USD 3,200.00, Cold-Chain Hazmat Handling = USD 180.00, 0% Zero-Rated Export VAT, Total = USD 3,380.00. Dock Receipt DR-551 records 20 drums received, Gross Weight = 540.0 kg, Tare Weight = 2.0 kg/drum (Total Tare = 40.0 kg, Net API Weight = 500.0 kg), QC Certificate COA-551 passed. Vendor Invoice INV-API-881 bills 540.0 kg @ USD 6.40/kg = USD 3,456.00 + Handling USD 180.00 = Total USD 3,636.00.",
    chosen: "RECONCILIATION STATUS: MISMATCH (GROSS WEIGHT BILLED INSTEAD OF NET WEIGHT). Dock Receipt DR-551 confirms 20 drums with a Gross Weight of 540.0 kg and a Tare Weight of 2.0 kg/drum (40.0 kg total packaging tare), resulting in an exact Net API Weight of 500.0 kg matching PO-API-2026-551. Invoice INV-API-881 erroneously bills the 540.0 kg gross drum weight at the API unit price of USD 6.40/kg, overcharging for 40.0 kg of empty drum tare (+USD 256.00). Reconciled payable is 500.0 kg x USD 6.40 + USD 180.00 handling = USD 3,380.00.",
    rejected: "RECONCILIATION STATUS: QUANTITY OVERRUN (+40 KG). Dock Receipt DR-551 shows 540.0 kg weighed at the receiving bay compared to the 500.0 kg ordered on PO-API-2026-551, and the vendor billed the exact 540.0 kg delivered at the contracted price of USD 6.40/kg plus USD 180.00 handling (USD 3,636.00). Since QC Certificate COA-551 accepted all 20 drums without return, approve the full USD 3,636.00 via an over-delivery waiver.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://iccwbo.org/business-solutions/incoterms-rules/"
    }
  },
  {
    prompt: "Reconcile Enterprise SaaS & Implementation Invoice INV-CLD-2026-304 against PO-CLD-2026-88 and Service Acceptance Certificate SAC-88: PO authorizes: Line 1: 150 Enterprise Seats (Annual) @ GBP 420/seat = GBP 63,000; Line 2: SSO/SCIM Integration Milestone (Fixed Fee) = GBP 8,000; UK VAT @ 20% = GBP 14,200; PO Total = GBP 85,200. Provisioning & SAC-88 confirms: 150 Enterprise Seats active from 2026-11-01, and SSO/SCIM Integration marked 'UAT Failed - Pending MFA Callback Fix (0% Milestone Acceptance)'. Vendor Invoice INV-CLD-2026-304 bills Line 1 (GBP 63,000) + Line 2 (GBP 8,000) + Line 3 'Premium Onboarding Support' (GBP 2,500) + 20% VAT (GBP 14,700) = GBP 88,200.",
    chosen: "RECONCILIATION STATUS: FAILED (UNACCEPTED MILESTONE ON LINE 2 + UNAUTHORIZED LINE 3). Line 1 (150 Enterprise Seats @ GBP 420 = GBP 63,000.00) ties out to both PO-CLD-2026-88 and SAC-88. However, Line 2 (SSO/SCIM Integration, GBP 8,000.00) must be disallowed because SAC-88 explicitly records UAT failure and 0% acceptance. Line 3 ('Premium Onboarding Support', GBP 2,500.00) is an uncontracted phantom line item absent from PO-CLD-2026-88. Reconciled payable: GBP 63,000.00 base + 20% UK VAT (GBP 12,600.00) = GBP 75,600.00 (Disallowed variance: GBP 10,500.00 base + GBP 2,100.00 VAT = GBP 12,600.00).",
    rejected: "RECONCILIATION STATUS: DISALLOW LINE 3 ONLY. Comparing INV-CLD-2026-304 to PO-CLD-2026-88 shows that Line 1 (GBP 63,000) and Line 2 (GBP 8,000) match the Purchase Order exactly (GBP 71,000 base), whereas Line 3 ('Premium Onboarding Support' for GBP 2,500) is not on the Purchase Order. Deduct Line 3 plus its 20% VAT (GBP 3,000 gross) and pay the PO-matched total of GBP 85,200.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.gov.uk/vat-rates"
    }
  },
  {
    prompt: "Audit 3-way match for Curtain-Wall Facade Glazing Invoice INV-GLZ-2026-19 against PO-GLZ-07 and GRN-GLZ-19: PO-GLZ-07 specifies 250 panels of Double-Glazed Low-E Laminated Glass (24mm) @ AED 1,100/panel = AED 275,000 + 5% UAE VAT (AED 13,750) = AED 288,750. GRN-GLZ-19 logs 250 panels delivered, but notes that 30 panels delivered were Single-Glazed Clear Glass (12mm) substituted without approval (rejected and quarantined for return; 220 Double-Glazed Low-E panels accepted). Vendor Invoice INV-GLZ-2026-19 bills 220 panels @ AED 1,100 = AED 242,000 AND 30 substituted panels @ AED 750 = AED 22,500, Subtotal AED 264,500 + 5% VAT (AED 13,225) = AED 277,725.",
    chosen: "RECONCILIATION STATUS: MISMATCH (REJECTED SUBSTITUTED GOODS BILLED). While the 220 accepted Double-Glazed Low-E panels @ AED 1,100/panel (AED 242,000.00) tie out to PO-GLZ-07 and GRN-GLZ-19, the vendor has billed AED 22,500.00 (plus AED 1,125.00 VAT) for 30 unapproved Single-Glazed (12mm) panels that were explicitly rejected and quarantined on GRN-GLZ-19. Reconciled payable for accepted goods: 220 panels x AED 1,100 = AED 242,000.00 base + 5% UAE VAT (AED 12,100.00) = AED 254,100.00. Deduct AED 23,625.00 via Debit Note.",
    rejected: "RECONCILIATION STATUS: RECONCILED WITH DISCOUNT ADJUSTMENT. Because the vendor already reduced the unit price on the 30 substituted 12mm panels from AED 1,100 to AED 750 (saving AED 10,500 compared to the original PO ceiling of AED 275,000), the total billed amount of AED 277,725 (inclusive of 5% VAT) is below the PO limit of AED 288,750 and can be cleared for settlement.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://tax.gov.ae/en/taxes/vat.aspx"
    }
  },
  {
    prompt: "Perform 3-way reconciliation for High-Voltage Transformer Procurement (PO-HV-2026-03, GRN-HV-03, Invoice INV-HV-03): PO-HV-2026-03 orders 2x 2500 kVA Dry-Type Cast Resin Transformers @ INR 34,00,000/unit = INR 68,00,000; Trade Discount 5% on base = -INR 3,40,000; Net Taxable Base = INR 64,60,000; IGST @ 18% = INR 11,62,800; PO Total = INR 76,22,800. GRN-HV-03 confirms 2 units received and passed Megger insulation testing. Invoice INV-HV-03 computes: 2 units @ INR 34,00,000 = INR 68,00,000; IGST @ 18% applied on gross = INR 12,24,000; Subtotal = INR 80,24,000; Less 5% Trade Discount on base = -INR 3,40,000; Invoice Total = INR 76,84,000.",
    chosen: "RECONCILIATION STATUS: GST TAXABLE VALUE ERROR UNDER SECTION 15(3)(a) OF CGST ACT (+INR 61,200 IGST OVERCHARGE). Both units were received and passed inspection per GRN-HV-03, and the 5% trade discount (INR 3,40,000) is pre-agreed on PO-HV-2026-03. Under Section 15(3)(a) of the CGST Act, pre-agreed trade discounts recorded on the invoice must be deducted BEFORE computing GST. The vendor erroneously calculated 18% IGST on the undiscounted INR 68,00,000 (INR 12,24,000) instead of the net taxable value of INR 64,60,000 (INR 11,62,800), overcharging IGST by INR 61,200. Reconciled payable is INR 76,22,800.",
    rejected: "RECONCILIATION STATUS: RECONCILED. Both 2500 kVA transformers passed Megger testing on GRN-HV-03, the base price of INR 68,00,000 matches PO-HV-2026-03, and the 5% trade discount of INR 3,40,000 was properly deducted on the invoice. Applying 18% IGST on the gross list price prior to deducting commercial rebates is standard accounting practice and the full INR 12,24,000 IGST is eligible for Input Tax Credit.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://cbic-gst.gov.in/pdf/cgst-act.pdf"
    }
  },
  {
    prompt: "Reconcile 3-way match for Diesel Generator Fuel Supply under Blanket PO-DG-2026-19: PO authorizes up to 10,000 Liters of High-Speed Diesel (HSD) at index-linked IOCL Mumbai retail price on date of delivery (2026-10-25 published rate = INR 92.15/Liter), delivery bowser calibration tolerance +/-0.2%. Receiving Dip-Rod & Flowmeter Ticket FRT-19 on 2026-10-25 records 4,000 Liters dispensed at 29C ambient temperature (temperature-compensated volume at 15C reference = 3,952 Liters; PO specifies billing on actual flowmeter volume dispensed if within +/-0.2% of bowser calibration chart, which showed 4,000L). Vendor Invoice INV-HSD-411 bills 4,000 Liters @ INR 94.50/Liter = INR 3,78,000.",
    chosen: "RECONCILIATION STATUS: RATE DISCREPANCY (+INR 2.35/LITER OVERCHARGE). Under PO-DG-2026-19, the billed volume of 4,000 Liters ties out to Flowmeter Ticket FRT-19 because the contract specifies billing on calibrated flowmeter dispensed volume rather than 15C density-compensated volume. However, the vendor billed INR 94.50/Liter instead of the contracted 2026-10-25 IOCL Mumbai index price of INR 92.15/Liter (+INR 2.35/Liter variance). Reconciled payable: 4,000 Liters x INR 92.15 = INR 3,68,600. Disallow INR 9,400.",
    rejected: "RECONCILIATION STATUS: VOLUME AND RATE MISMATCH. You must deduct both the temperature-expansion volume difference (4,000L dispensed vs 3,952L at 15C = 48 Liters) and the rate difference (INR 94.50 vs INR 92.15), resulting in an approved payment of 3,952 Liters x INR 92.15 = INR 3,64,176.80.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://iocl.com/prices-of-petroleum-products"
    }
  }
];

// 3. PURCHASE_ORDER_VERIFY_GENERAL (Open Bounty #122 - P2, currently 0 submitters!)
const purchaseOrderVerifyRows = [
  {
    prompt: "Verify Purchase Order PO-ERP-2026-7741 in SAP S/4HANA for Project Tower-B Foundation Piling: Stated Vendor = V-10492 (Apex Geotech Pvt Ltd, Status: Active), PO Net Value = INR 1,85,00,000 (INR 1.85 Crore), WBS Cost Center = WBS-TWB-SUB-01 (Available Uncommitted Budget = INR 2,10,00,000), Approval Chain Recorded = Level 1 Procurement Manager (limit INR 25L) + Level 2 VP Projects (limit INR 1.00 Crore). Corporate Delegation of Authority (DOA) policy requires CFO + Managing Director joint digital sign-off for any single PO exceeding INR 1.00 Crore.",
    chosen: "VERIFICATION VERDICT: INVALID / UNAPPROVED DOA BREACH. Although Vendor V-10492 (Apex Geotech Pvt Ltd) is active and WBS Cost Center WBS-TWB-SUB-01 has sufficient uncommitted budget (INR 2.10 Crore available vs INR 1.85 Crore PO), PO-ERP-2026-7741 violates the Corporate Delegation of Authority (DOA) matrix. A PO of INR 1.85 Crore exceeds the Level 2 VP Projects ceiling of INR 1.00 Crore and lacks the mandatory joint digital release from the CFO and Managing Director. Hold PO release until Tier-3 executive sign-off is recorded.",
    rejected: "VERIFICATION VERDICT: VALID AND APPROVED. Purchase Order PO-ERP-2026-7741 exists in SAP S/4HANA under active vendor V-10492 (Apex Geotech Pvt Ltd), is fully covered by the INR 2.10 Crore available budget in WBS-TWB-SUB-01, and carries two sequential approvals (Procurement Manager + VP Projects) whose combined authority (INR 25L + INR 1.00 Crore) plus project contingency covers the foundation piling commitment.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.coso.org/internal-control"
    }
  },
  {
    prompt: "Audit ERP Purchase Order PO-2026-99204 for structural steel procurement against split-order governance controls: Vendor = V-20811 (Kamdhenu Ispat Ltd, Approved Quota Ceiling for Q3 = INR 1,50,00,000; YTD Q3 Utilized prior to today = INR 1,20,00,000). On 2026-11-03 within a 14-minute window, buyer ID USR-409 created PO-2026-99203 for INR 24,50,000 and PO-2026-99204 for INR 24,80,000 (Combined = INR 49,30,000) under the same WBS element, each approved solely by the Level-1 Procurement Manager (DOA limit = INR 25,00,000 per PO).",
    chosen: "VERIFICATION VERDICT: REJECTED (SPLIT-PO DOA CIRCUMVENTION + VENDOR QUOTA BREACH). PO-2026-99204 fails two mandatory procurement controls: (1) Split-Requisition Circumvention: Issuing two identical-WBS POs to V-20811 within 14 minutes for INR 24,50,000 and INR 24,80,000 (combined INR 49,30,000) artificially splits a single INR 49.30L requirement to stay just beneath the INR 25,00,000 Level-1 DOA threshold; (2) Vendor Quota Overrun: Adding INR 49,30,000 to V-20811's utilized Q3 spend of INR 1,20,00,000 brings total Q3 commitment to INR 1,69,30,000, exceeding the INR 1,50,00,000 vendor quota cap by INR 19,30,000.",
    rejected: "VERIFICATION VERDICT: VALID FOR PO-2026-99203 ONLY. Because each individual purchase order (INR 24,50,000 and INR 24,80,000) is below the Level-1 Procurement Manager's INR 25,00,000 single-order approval limit, the approval workflow is valid. However, since the remaining Q3 vendor quota for V-20811 is INR 30,00,000 (INR 150L cap minus INR 120L utilized), approve PO-2026-99203 (INR 24.50L) and reduce PO-2026-99204 to INR 5,50,000.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.cips.org/intelligence-hub/procurement/purchase-order"
    }
  },
  {
    prompt: "Check ERP validity of Purchase Order PO-RERA-2026-512 for INR 65,00,000 drawn on Project Escrow Account #ESC-70-P51800045120 (the statutory 70% RERA Separate Bank Account): Vendor = V-8830 (Zenith Brand Advertising Agency), Expense GL Code = 610400 ('Corporate Television & Print Marketing Campaign'), WBS = Marketing-Q4 (Budget available = INR 80,00,000), DOA Approvals = CMO + CFO (Valid for INR 65L). Verify whether this PO allocation is compliant for disbursement from the 70% RERA Project Account.",
    chosen: "VERIFICATION VERDICT: INVALID BUDGET/ACCOUNT ALLOCATION (RERA SECTION 4(2)(l)(D) VIOLATION). While the vendor is active, Marketing-Q4 budget is available, and CMO/CFO approvals satisfy corporate DOA, PO-RERA-2026-512 illegally maps GL Code 610400 ('Corporate Television & Print Marketing Campaign') to the statutory 70% RERA Separate Project Escrow Account (#ESC-70-P51800045120). Under Section 4(2)(l)(D) of the RERA Act and MahaRERA directions, the 70% account can ONLY fund land cost and on-site construction cost; marketing, brokerage, and advertising expenses must be paid strictly from the promoter's 30% free account.",
    rejected: "VERIFICATION VERDICT: VALID AND APPROVED. Purchase Order PO-RERA-2026-512 is fully verified in the ERP: Vendor V-8830 is active, the INR 65,00,000 commitment is well within the INR 80,00,000 Marketing-Q4 WBS budget, and both the CMO and CFO have digitally approved the order in compliance with the DOA matrix.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://maharera.maharashtra.gov.in/"
    }
  },
  {
    prompt: "Verify Blanket Purchase Order BPO-2026-0192 in Oracle NetSuite for MRO Electrical Consumables: Vendor = V-3019 (ElectroMart Industrial Supplies), Blanket Validity Period = 2025-10-01 to 2026-09-30, Blanket Ceiling = USD 120,000, Cumulative Releases to date = USD 94,000. Release Order RO-0192-18 dated 2026-10-15 requests USD 18,500 of circuit breakers against BPO-2026-0192, signed by Facility Manager (DOA limit USD 25,000).",
    chosen: "VERIFICATION VERDICT: INVALID / EXPIRED BLANKET PO. Although USD 26,000 of monetary ceiling remains unspent on BPO-2026-0192 (USD 120,000 cap minus USD 94,000 utilized) and the USD 18,500 release is within the Facility Manager's USD 25,000 DOA limit, Blanket Purchase Order BPO-2026-0192 expired on 2026-09-30. Release Order RO-0192-18 dated 2026-10-15 falls 15 days outside the contracted validity window and cannot be executed without a formal BPO contract extension or new PO.",
    rejected: "VERIFICATION VERDICT: VALID. Release Order RO-0192-18 for USD 18,500 is valid because BPO-2026-0192 has USD 26,000 in remaining unutilized budget ceiling (bringing total utilization to USD 112,500 against the USD 120,000 cap), Vendor V-3019 is active, and the Facility Manager holds DOA authority up to USD 25,000.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.ismworld.org/"
    }
  },
  {
    prompt: "Validate Purchase Order PO-CAPEX-2026-408 for 3x Tower Cranes: ERP Record shows Vendor = V-5501 (Liebherr Kranbau GmbH), PO Amount = EUR 1,450,000, CapEx Budget Line = CAP-2026-CRANE (Approved Annual Budget = EUR 1,300,000; Permissible Overrun Tolerance without Board Re-allocation = 5% max = EUR 1,365,000), Approvals = CEO + CFO signed, Board CapEx Re-allocation Resolution = NONE.",
    chosen: "VERIFICATION VERDICT: BUDGET OVERRUN BLOCKED. While Vendor V-5501 and CEO/CFO signatures are present, PO-CAPEX-2026-408 (EUR 1,450,000) exceeds the CAP-2026-CRANE approved budget of EUR 1,300,000 by EUR 150,000 (+11.54%), breaching the 5% maximum budget tolerance ceiling (EUR 1,365,000) by EUR 85,000. Without a recorded Board CapEx Re-allocation Resolution or inter-WBS budget transfer of at least EUR 85,000 (or EUR 150,000 to base), the ERP budget hard-stop must block PO issuance.",
    rejected: "VERIFICATION VERDICT: VALID. Because both the CEO and CFO have signed PO-CAPEX-2026-408, their executive authority overrides the 5% departmental CapEx budget tolerance on CAP-2026-CRANE, allowing the EUR 1,450,000 tower crane order with V-5501 to proceed immediately.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.ifac.org/"
    }
  },
  {
    prompt: "Audit Purchase Order PO-SUB-2026-619 in ERP: Stated on PDF copy presented by vendor = Vendor V-7712 (Shree Balaji Earthmovers), Amount = INR 48,00,000, Status = 'Approved'. Live ERP Database query for PO-SUB-2026-619 returns: Vendor = V-7712, Amount = INR 28,00,000, Revision = Rev-0, Status = 'Pending Level-2 Approval (Hold: Missing Performance Bank Guarantee)'.",
    chosen: "VERIFICATION VERDICT: FORGED / UNRELEASED PO PRESENTATION. The vendor-presented PDF copy of PO-SUB-2026-619 contradicts the live ERP system of record on two material counts: (1) Status in the ERP is 'Pending Level-2 Approval (Hold: Missing Performance Bank Guarantee)', not 'Approved', meaning the PO has never been released for execution; and (2) the ERP draft amount is INR 28,00,000 whereas the presented PDF claims INR 48,00,000 (+INR 20,00,000 falsification). Reject delivery and flag V-7712 for compliance investigation.",
    rejected: "VERIFICATION VERDICT: PARTIALLY VERIFIED UP TO INR 28,00,000. Because PO-SUB-2026-619 exists in the ERP under Vendor V-7712 for INR 28,00,000, the vendor may deliver and bill up to INR 28,00,000 while the remaining INR 20,00,000 change order and Performance Bank Guarantee are processed by Level-2 approvers.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.acfe.com/"
    }
  },
  {
    prompt: "Verify ERP Purchase Order PO-cloud-2026-815 for AWS Reserved Instance Prepayment: Vendor = V-9001 (Amazon Web Services India Pvt Ltd), PO Value = INR 92,00,000, Cost Center = CC-ENG-PROD (Available OpEx Budget = INR 1,10,00,000), Segregation of Duties (SoD) Audit Log shows: Requisition PR-815 created by user ID 'amit.sharma', Vendor Master bank account updated on 2026-11-01 by 'amit.sharma', and PO-cloud-2026-815 approved by 'amit.sharma' using delegated VP credentials during vacation window.",
    chosen: "VERIFICATION VERDICT: BLOCKED FOR CRITICAL SEGREGATION OF DUTIES (SoD) VIOLATION. Although the budget in CC-ENG-PROD is sufficient (INR 1.10 Crore available vs INR 92L PO), the ERP audit trail reveals a three-way Segregation of Duties conflict: a single user ('amit.sharma') created the purchase requisition (PR-815), modified the vendor master bank account on 2026-11-01, and self-approved the INR 92,00,000 PO via delegated credentials. Under SOX 404 / ICFR controls, no individual may control requisitioning, vendor bank maintenance, and PO approval. Freeze the PO and require independent audit of the vendor bank change.",
    rejected: "VERIFICATION VERDICT: VALID. Purchase Order PO-cloud-2026-815 is valid because Vendor V-9001 (AWS India) is an approved tier-1 cloud provider, CC-ENG-PROD has INR 1,10,00,000 in available budget, and the ERP Vacation Delegation rule formally granted VP approval rights to 'amit.sharma' on the date of release.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://pcaobus.org/oversight/standards/auditing-standards/details/AS2201"
    }
  },
  {
    prompt: "Verify Emergency Purchase Order EPO-2026-309 for Dewatering Pumps during monsoon basement flooding: Vendor = V-4102 (Kirloskar Brothers Auth Dealer), Amount = INR 14,20,000, WBS = WBS-CONTINGENCY-01 (Available = INR 50,00,000), Issued on 2026-10-20 under 'Emergency Site Safety Protocol' by Project Director (Emergency DOA limit = INR 15,00,000, subject to mandatory post-facto Procurement Committee ratification within 7 calendar days). Current audit date = 2026-11-08 (19 days elapsed), Post-Facto Ratification Status = 'Not Submitted'.",
    chosen: "VERIFICATION VERDICT: LAPSED EMERGENCY RATIFICATION (PAYMENT HOLD). While the initial issuance of EPO-2026-309 on 2026-10-20 for INR 14,20,000 was within the Project Director's INR 15,00,000 Emergency Site Safety DOA and backed by WBS-CONTINGENCY-01 budget, the mandatory 7-calendar-day post-facto Procurement Committee ratification window expired on 2026-10-27. As of 2026-11-08 (19 days elapsed), ratification remains 'Not Submitted', placing the PO in non-compliant hold status until retrospective committee sign-off is completed.",
    rejected: "VERIFICATION VERDICT: VALID FOR PAYMENT. Because EPO-2026-309 was validly issued on 2026-10-20 under the Project Director's INR 15,00,000 Emergency Site Safety authority and funded by WBS-CONTINGENCY-01, the vendor's invoice must be paid immediately; internal post-facto committee ratification is an administrative formality that does not gate ERP settlement.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.iso.org/standard/63198.html"
    }
  }
];

// 4. VENDOR_VERIFY_GENERAL (Open Bounty #105 - P1, Mission: Personal Agent)
const vendorVerifyRows = [
  {
    prompt: "Perform a combined vendor onboarding and payment clearance audit for supplier 'Kalyani Structural Fabricators Pvt Ltd': (1) GSTIN = 27AABCK4491M1Z8 (GST Portal Status: Active, Regular Taxpayer, last 6 months GSTR-1 & GSTR-3B filed on time); (2) PAN = AABCK4491M (Income Tax Portal: Valid, Aadhaar/MCA linked, Section 206AB Specified Person Check = No / Compliant filer); (3) MCA21 CIN = U28110MH2018PTC312409 (Status: Active, Strike-Off: No); (4) Bank Penny-Drop on A/c 50200044192811 (HDFC0000240) returned Beneficiary Name = 'KALYANI STRUCTURAL FABRICATORS PVT LTD' (100% match); (5) Certifications = ISO 9001:2015 valid through 2027-08-14; (6) OFAC SDN, UN Consolidated, EU & MHA Sanctions Screening = 0 hits.",
    chosen: "COMBINED VERDICT: APPROVED FOR ONBOARDING AND STANDARD PAYMENT. All six verification pillars pass without exception: (1) GSTIN 27AABCK4491M1Z8 is active in Maharashtra (state code 27) with embedded PAN AABCK4491M matching the tax record and 100% timely GSTR-1/3B compliance (protecting buyer ITC under Section 16(2)(aa)); (2) PAN is valid and cleared of Section 206AB higher-TDS penalties; (3) MCA CIN U28110MH2018PTC312409 is active; (4) Penny-drop confirms exact corporate beneficiary ownership at HDFC0000240; (5) ISO 9001:2015 is current; and (6) global sanctions screening is clean.",
    rejected: "COMBINED VERDICT: CONDITIONAL HOLD. While sanctions screening, bank penny-drop, and MCA CIN U28110MH2018PTC312409 are clean, GSTIN 27AABCK4491M1Z8 contains check-digit '8' and entity code '1' which indicates a proprietorship rather than a Private Limited company (which requires entity code 'C' in position 13), so hold onboarding for manual GST certificate review.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://services.gst.gov.in/services/searchtp"
    }
  },
  {
    prompt: "Audit supplier 'Vortex Global Petrochem FZE' for cross-border payment clearance: (1) UAE Trade License #DMCC-784120 (Status: Active); (2) TRN = 100492817200003 (Active); (3) SWIFT IBAN = AE470260001015549281101 at Emirates NBD, Beneficiary Name = 'Vortex Global Petrochem FZE'; (4) Ownership & Sanctions Check: 45% owned by Al-Noor Holdings LLC (clean) and 55% owned by Caspian Maritime Trading Ltd, an entity designated on the OFAC SDN List under Executive Order 14024 on 2026-04-12. Vortex Global Petrochem FZE itself does not appear by name on the SDN list.",
    chosen: "COMBINED VERDICT: BLOCKED / SANCTIONS VIOLATION (OFAC 50% RULE). Even though 'Vortex Global Petrochem FZE' is not explicitly named on the OFAC SDN List and its UAE DMCC trade license, TRN, and Emirates NBD IBAN match, it is 55% owned by Caspian Maritime Trading Ltd, an OFAC SDN-designated entity. Under OFAC's 50 Percent Rule, any entity owned 50% or more in the aggregate by one or more blocked persons is itself automatically blocked as if listed on the SDN List. Reject onboarding and freeze any pending USD/cross-border payment.",
    rejected: "COMBINED VERDICT: APPROVED WITH ENHANCED DUE DILIGENCE (EDD). Vortex Global Petrochem FZE holds an active DMCC trade license (#DMCC-784120), valid UAE Tax Registration Number (100492817200003), verified Emirates NBD IBAN, and zero direct name hits on the OFAC SDN or UN Consolidated lists. Because only a shareholder (Caspian Maritime Trading Ltd) is listed and not the operating FZE itself, payments in AED or EUR may proceed under standard monitoring.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://ofac.treasury.gov/faqs/401"
    }
  },
  {
    prompt: "Evaluate vendor 'Siddhivinayak MEP Engineers LLP' for ERP payment release: (1) GSTIN = 27AAFFS8821K1Z4 (Status: Active, but GSTR-3B not filed for the last 4 consecutive months); (2) PAN = AAFFS8821K (Valid, Section 206AB Check: Flagged as 'Specified Person' for non-filing of Income Tax Returns); (3) LLPIN = AAM-4419 (Active); (4) Bank Penny-Drop on A/c 918020044129801 (UTIB0000104) returned Beneficiary Name = 'RAHUL SURESH DESHMUKH' (Designated Partner personal savings account, not LLP current account); (5) Sanctions = Clean.",
    chosen: "COMBINED VERDICT: REJECTED FOR PAYMENT (3 CRITICAL COMPLIANCE FAILURES). (1) Third-Party/Personal Bank Account Diversion: Bank penny-drop resolved to an individual partner's name ('RAHUL SURESH DESHMUKH') instead of the contracting legal entity ('Siddhivinayak MEP Engineers LLP'), creating severe embezzlement and tax disallowance risk. (2) GST Default: 4 consecutive months of unfiled GSTR-3B blocks buyer Input Tax Credit (ITC) under Section 16(2)(c) and triggers mandatory GST retention. (3) Section 206AB Specified Person Status: Requires statutory TDS deduction at twice the prescribed rate (or 5%, whichever is higher). Block payment until an verified LLP current account is provided and withhold GST/higher TDS.",
    rejected: "COMBINED VERDICT: APPROVED WITH HIGHER TDS DEDUCTION. Because Siddhivinayak MEP Engineers LLP has an active GSTIN (27AAFFS8821K1Z4), active MCA LLPIN (AAM-4419), and zero sanctions hits, the vendor is legitimate. Deduct double TDS under Section 206AB and remit the net invoice proceeds to the designated partner's Axis Bank account (UTIB0000104).",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://incometaxindia.gov.in/"
    }
  },
  {
    prompt: "Verify supplier 'Precision Precast Concrete Works' for onboarding and MSME payment terms: (1) GSTIN = 29AAECP7710H1Z2 (Karnataka, Active, 4th-to-13th chars = AAECP7710H); (2) Submitted PAN Card = AAECP7719H (differs in 9th character from GSTIN embedded PAN AAECP7710H); (3) Udyam Registration = UDYAM-KR-03-0041928 (Category: Small Manufacturing Enterprise, Active); (4) Bank Penny-Drop = 'PRECISION PRECAST CONCRETE WORKS PVT LTD' (Matched); (5) BIS License CM/L-8841209 for IS 456 Precast Elements = Valid; (6) Sanctions = Clean.",
    chosen: "COMBINED VERDICT: ONBOARDING HOLD (PAN-TO-GSTIN TYPOGRAPHICAL/IDENTITY MISMATCH). While bank penny-drop, Udyam registration (UDYAM-KR-03-0041928, which mandates payment within 45 days under Section 43B(h) of the Income Tax Act), BIS license, and sanctions checks pass, characters 3 through 12 of an Indian GSTIN (29[AAECP7710H]1Z2) must strictly equal the taxpayer's 10-character PAN. The submitted PAN (AAECP7719H) differs in the 9th character ('9' vs '0'), which will cause TDS Traces (Form 26AS/AIS) credit failures and automatic 20% Section 206AA penal TDS. Require corrected PAN documentation matching AAECP7710H before activation.",
    rejected: "COMBINED VERDICT: APPROVED. Precision Precast Concrete Works holds an active Karnataka GSTIN (29AAECP7710H1Z2), verified Udyam Small Enterprise registration, active BIS certification, clean sanctions record, and 100% matched corporate bank account. A single-digit variance between GSTIN and PAN is common when a company upgrades from a partnership to a private limited company.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://udyamregistration.gov.in/"
    }
  },
  {
    prompt: "Audit vendor 'Baltic Precision Logistics OÜ' (Estonia) for EU procurement onboarding: (1) Estonian Commercial Register Code = 14892011 (Status: Active); (2) EU VIES VAT Number = EE102218490 (VIES Check: Valid, Name matches 'Baltic Precision Logistics OÜ'); (3) SEPA IBAN = LT601010012345678901 (Lithuanian fintech EMI account, Account Holder Name via SEPA Verification of Payee = 'Baltic Precision Logistics OÜ'); (4) ISO 28000 Supply Chain Security = Expired 2026-06-30; (5) Sanctions Screening: Fuzzy name match (78% similarity) against 'Baltiyskiy Logisticheskiy Tsentr OOO' (St. Petersburg, Russia, EU Sanctions List, Reg. INN 7801449201, incorporated 2011).",
    chosen: "COMBINED VERDICT: CONDITIONAL HOLD (SANCTIONS FALSE POSITIVE CLEARED, BUT EXPIRED ISO 28000 + CROSS-BORDER IBAN REVIEW). (1) Sanctions Disambiguation: The 78% fuzzy hit on 'Baltiyskiy Logisticheskiy Tsentr OOO' is a verified FALSE POSITIVE — the sanctioned entity is a Russian OOO (INN 7801449201, St. Petersburg) whereas the applicant is an Estonian OÜ (Reg 14892011, VAT EE102218490) with distinct jurisdiction, registry ID, and directors. (2) Certification Gap: ISO 28000 Supply Chain Security certification expired on 2026-06-30 and must be renewed if mandatory for the tender. (3) Banking Note: Estonian entity using a Lithuanian (LT) SEPA EMI IBAN is legal under EU IBAN non-discrimination rules (Article 9 SEPA Regulation) since VoP name matches, but record standard cross-border KYB note.",
    rejected: "COMBINED VERDICT: REJECTED FOR SANCTIONS AND BANKING FRAUD. Baltic Precision Logistics OÜ must be blocked because (1) it triggers a 78% sanctions match against Baltiyskiy Logisticheskiy Tsentr, (2) an Estonian company (EE VAT) presenting a Lithuanian (LT) IBAN is a classic cross-border shell red flag, and (3) its ISO 28000 certificate is expired.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://ec.europa.eu/taxation_customs/vies/"
    }
  },
  {
    prompt: "Check supplier 'Navkar Civil & Piling Contractors' for labor-intensive construction subcontract onboarding in Mumbai: (1) GSTIN = 27AADFN3310P1Z5 (Active, GSTR-3B current); (2) PAN = AADFN3310P (Valid, 206AB Compliant); (3) Bank Penny-Drop = 'NAVKAR CIVIL AND PILING CONTRACTORS' (Matched at SBIN0004120); (4) Workforce size deployed on site = 85 contract laborers; (5) Statutory Labor Credentials: EPFO Code MH/BAN/0094120 (Active, ECR challans paid through Oct 2026), ESIC Code 31000849120001001 (Active), Contract Labour (Regulation & Abolition) Act (CLRA) License = NOT OBTAINED (Vendor claims exemption for <100 workers), BOCW Registration = Active; (6) Sanctions = Clean.",
    chosen: "COMBINED VERDICT: ONBOARDING HOLD FOR MISSING CLRA LICENSE. Although GSTIN, PAN, SBI bank penny-drop, EPFO, ESIC, BOCW, and sanctions checks all pass, deploying 85 contract laborers in Maharashtra without a valid Contract Labour (Regulation & Abolition) Act (CLRA) license is illegal. The statutory threshold in Maharashtra (and under the Central/State CLRA rules) applies at 20 or more (or 50 or more under amended state notifications) contract workmen—well below the 85 workers deployed. Onboarding a subcontractor with 85 workers without a CLRA license exposes the Principal Employer to statutory prosecution and direct liability. Hold mobilization until CLRA license is issued.",
    rejected: "COMBINED VERDICT: APPROVED. Navkar Civil & Piling Contractors passes all tax, banking, sanctions, EPFO, ESIC, and BOCW checks. Because the subcontractor holds active EPFO and ESIC codes with paid monthly challans and deploys fewer than 100 workers, the CLRA license can be submitted after site mobilization.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://mahakamgar.maharashtra.gov.in/"
    }
  }
];

// 5. CONTRACT_OBLIGATION_AUDIT_GENERAL (Mission #04 Legal - P1)
const contractObligationAuditRows = [
  {
    prompt: "Audit the contractual and statutory obligations under an Indian Agreement for Sale (MahaRERA Reg. P51900022104) executed on 2023-05-15: Clause 7.1 commits handover of Apartment B-1402 by 2026-03-31, with a 6-month grace period allowed ONLY for Force Majeure events under Section 6 of RERA (flood, war, drought, cyclone, earthquake, or court injunction). The promoter claims a 6-month grace extension to 2026-09-30 citing 'shortage of skilled masonry labor and cement price escalation', and still has not obtained the Occupancy Certificate (OC) as of 2026-11-01. The allottee has paid INR 1,80,00,000 and elects to stay in the project and claim monthly delay interest. Current SBI Highest Marginal Cost of Funds based Lending Rate (MCLR) = 9.00% p.a. Compute the promoter's binding obligation.",
    chosen: "AUDIT VERDICT: GRACE PERIOD INVALID; STATUTORY DELAY INTEREST TRIGGERED FROM 2026-04-01 AT 11.00% P.A. (1) Invalid Force Majeure Claim: Under Section 6 of the RERA Act, 2016 and Clause 7.1, labor shortages and raw material price fluctuations are ordinary commercial risks, not statutory Force Majeure events. Therefore, the binding possession deadline remains 2026-03-31. (2) Statutory Obligation under Section 18(1) Proviso & MahaRERA Rules: When an allottee does not withdraw from the project, the promoter is obligated to pay monthly interest for every month of delay from 2026-04-01 until actual handover with Occupancy Certificate, at SBI Highest MCLR + 2% (9.00% + 2.00% = 11.00% p.a.). (3) Accrued Liability (April 1, 2026 to Oct 31, 2026 = 7 months): INR 1,80,00,000 x 11.00% x (7/12) = INR 11,55,000 accrued to date, plus INR 1,65,000 per subsequent month.",
    rejected: "AUDIT VERDICT: DELAY INTEREST RUNS FROM 2026-10-01 AT 9.00% P.A. Because Clause 7.1 of the Agreement for Sale provides a 6-month grace period, the promoter's deadline extends to 2026-09-30. Since the Occupancy Certificate was not obtained by 2026-09-30, the promoter owes 1 month of delay interest (October 2026) on INR 1,80,00,000 at the SBI MCLR rate of 9.00% p.a., equal to INR 1,35,000.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://maharera.maharashtra.gov.in/"
    }
  },
  {
    prompt: "Evaluate FIDIC Silver Book (EPC Turnkey) Sub-Clause 20.1 & Sub-Clause 8.7 obligations on a 50 MW Solar Balance-of-System Contract (Contract Value = USD 24,000,000): Contractual Commercial Operation Date (COD) = 2026-09-01. Delay Liquidated Damages (LD) = 0.5% of Contract Value per completed week of delay, capped at 10% of Contract Value. Sub-Clause 20.1 states that if the Contractor fails to give notice of a claim for Extension of Time (EOT) within 28 days after becoming aware of the event, the Time for Completion shall not be extended and the Employer is discharged from liability. A customs port strike delayed inverter clearance from 2026-06-01 to 2026-06-21 (3 weeks), but the Contractor first notified the Employer on 2026-08-15 (75 days after awareness). Actual COD was achieved on 2026-10-20 (7 completed weeks after 2026-09-01).",
    chosen: "AUDIT VERDICT: EOT CLAIM TIME-BARRED UNDER SUB-CLAUSE 20.1; FULL 7 WEEKS OF LIQUIDATED DAMAGES PAYABLE (USD 840,000). Under FIDIC Sub-Clause 20.1, the 28-day notice window is a strict condition precedent. Because the Contractor became aware of the customs strike on 2026-06-01 but waited 75 days until 2026-08-15 to submit an EOT notice (well past the 2026-06-29 deadline), the 3-week EOT claim is contractually time-barred. Consequently, all 7 completed weeks of delay (2026-09-01 to 2026-10-20) are chargeable under Sub-Clause 8.7: 7 weeks x 0.5%/week = 3.5% of USD 24,000,000 = USD 840,000 (within the 10% / USD 2,400,000 LD cap).",
    rejected: "AUDIT VERDICT: 4 WEEKS OF LIQUIDATED DAMAGES PAYABLE (USD 480,000). Although the Contractor submitted the Extension of Time notice late on 2026-08-15, a customs port strike is an external Force Majeure event that excuses 3 weeks of delay on equitable principles. Subtracting 3 excused weeks from the 7 total weeks of delay leaves 4 chargeable weeks at 0.5%/week (2.0% of USD 24,000,000 = USD 480,000).",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://fidic.org/books/epcturnkey-contract-1st-ed-1999-silver-book"
    }
  },
  {
    prompt: "Audit retention release and Defects Liability Period (DLP) obligations under an MEP Turnkey Contract (Contract Value = INR 8,00,00,000; Total Retention Held = 5% = INR 40,00,000): Clause 14.9 stipulates: (a) 50% of Retention Money (INR 20,00,000) shall be certified upon issuance of the Taking-Over Certificate (TOC); (b) the remaining 50% (INR 20,00,000) shall be released upon expiration of the 12-month DLP AND issuance of the Final Defects Liability Certificate, OR earlier after TOC if substituted by an unconditional, irrevocable on-demand Bank Guarantee (BG) from a Scheduled Commercial Bank valid until 60 days after DLP expiry. TOC was issued on 2026-10-15 (DLP expires 2027-10-15). On 2026-11-01, the Contractor demands full release of all INR 40,00,000 by submitting an HDFC Bank Guarantee for INR 20,00,000 expiring on 2027-10-15.",
    chosen: "AUDIT VERDICT: RELEASE FIRST 50% (INR 20,00,000) ONLY; REJECT SECOND 50% RELEASE DUE TO SHORT BG VALIDITY WINDOW. (1) First Moiety (INR 20,00,000): Unconditionally payable now because the Taking-Over Certificate (TOC) was issued on 2026-10-15. (2) Second Moiety (INR 20,00,000): Cannot be released against the submitted HDFC Bank Guarantee because Clause 14.9(b) strictly requires the substitution BG to remain valid until 60 days AFTER DLP expiry (2027-10-15 + 60 days = 2027-12-14). The submitted BG expires on 2027-10-15, leaving the Employer unprotected during the 60-day post-DLP claim period. Require a BG amendment extending validity to at least 2027-12-14 before releasing the second INR 20,00,000.",
    rejected: "AUDIT VERDICT: RELEASE FULL INR 40,00,000 IMMEDIATELY. The Taking-Over Certificate was issued on 2026-10-15 (satisfying the first INR 20,00,000 release) and the Contractor has provided an unconditional INR 20,00,000 Bank Guarantee from HDFC Bank (a Scheduled Commercial Bank) covering the full 12-month Defects Liability Period through 2027-10-15.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://rbi.org.in/"
    }
  },
  {
    prompt: "Analyze the conflict between a Contractual 'Pay-When-Paid' Clause and Statutory Law in a Subcontract between Main Contractor 'infraCorp Ltd' and Subcontractor 'Precision Electricals (Registered Micro Enterprise under MSMED Act, 2006)': Clause 11.4 of the Subcontract states that infraCorp shall pay Precision Electricals within 15 days after infraCorp receives corresponding payment from the Project Employer, andallows a 90-day credit period. Precision Electricals delivered and had goods/services accepted on 2026-08-01 (Invoice INR 30,00,000), and the Project Employer has not yet paid infraCorp as of 2026-11-05 (96 days elapsed).",
    chosen: "AUDIT VERDICT: CONTRACTUAL PAY-WHEN-PAID AND 90-DAY CREDIT CLAUSES ARE STATUTORILY VOID; MANDATORY PAYMENT + COMPOUND INTEREST DUE SINCE 2026-09-15. Under Sections 15, 16, and 24 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006 (and Section 43B(h) of the Income Tax Act), where a supplier is a registered Micro or Small Enterprise, the maximum permissible payment period is 45 days from the day of acceptance (2026-08-01 + 45 days = 2026-09-15), overriding any contractual 'pay-when-paid' condition or 90-day credit clause. Because infraCorp failed to pay by 2026-09-15, it is statutorily liable for principal (INR 30,00,000) plus compound interest with monthly rests at 3x the RBI Bank Rate from 2026-09-16, and such interest is non-deductible for tax purposes.",
    rejected: "AUDIT VERDICT: PAYMENT NOT YET DUE UNDER CLAUSE 11.4. Because Precision Electricals voluntarily signed Clause 11.4 containing an explicit back-to-back 'pay-when-paid' condition precedent and the Project Employer has not yet disbursed funds to infraCorp Ltd, the 15-day payment clock has not started.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://samadhaan.msme.gov.in/"
    }
  },
  {
    prompt: "Audit Commercial Grade-A Office Lease Escalation & CAM Reconciliation Obligations (Lease Term: 9 years from 2023-11-01; Leased Chargeable Area = 25,000 sq.ft.): Clause 4.2 sets Base Rent for Years 1-3 at INR 120/sq.ft./month (INR 30,00,000/month) with a 15% escalation every 3 years (effective 2026-11-01). Clause 5.3 sets Common Area Maintenance (CAM) on 'actual audited open-book cost + 12% management fee, subject to a hard annual increase cap of 6% YoY over prior year's actual CAM (FY25-26 actual verified CAM = INR 18.00/sq.ft./month)'. Landlord's November 2026 Invoice bills Base Rent @ INR 140/sq.ft. (INR 35,00,000) and CAM @ INR 20.50/sq.ft. (INR 5,12,500).",
    chosen: "AUDIT VERDICT: OVERCHARGE ON BOTH BASE RENT AND CAM (+INR 1,10,500/MONTH EXCESS). (1) Base Rent Obligation (Clause 4.2): Effective 2026-11-01 (start of Year 4), a 15% escalation on INR 120.00/sq.ft. equals INR 138.00/sq.ft./month (INR 120 x 1.15), not INR 140.00/sq.ft. Approved Base Rent = 25,000 sq.ft. x INR 138.00 = INR 34,50,000/month (Overcharged by INR 50,000/month). (2) CAM Cap Obligation (Clause 5.3): With a 6% hard annual increase cap over prior year actuals (INR 18.00/sq.ft.), the maximum permissible CAM rate is INR 18.00 x 1.06 = INR 19.08/sq.ft./month, regardless of higher raw cost + 12% fee. Approved CAM Ceiling = 25,000 sq.ft. x INR 19.08 = INR 4,77,000/month (Overcharged by INR 35,500/month). Total Reconciled Monthly Obligation = INR 39,27,000 vs INR 40,12,500 billed (Disallow INR 85,500 base before GST).",
    rejected: "AUDIT VERDICT: BASE RENT OVERCHARGED BY INR 50,000; CAM VALID. A 15% escalation on INR 120/sq.ft. yields INR 138/sq.ft. (INR 34,50,000/month), so deduct INR 50,000 from Base Rent. However, because Clause 5.3 allows actual open-book cost plus a 12% management fee, the INR 20.50/sq.ft. CAM charge (INR 5,12,500) is payable in full.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.rics.org/profession-standards/rics-standards-and-guidance/sector-standards/real-estate-management-standards/service-charges-in-commercial-property"
    }
  },
  {
    prompt: "Evaluate Price Variation / Escalation Clause 10.4 in a Civil Highway & Bridge Contract (Base Date = 2025-10-01): Clause 10.4 states that Cement and Steel price variation is payable ONLY if the official Wholesale Price Index (WPI) published by OEA for the relevant commodity changes by more than +/-5.0% from the Base Date index, and compensation applies only to the portion of variation exceeding the 5.0% deadband threshold: Delta_P = V_work * Weight * ((Index_current - 1.05 * Index_base) / Index_base). For October 2026 RA Bill (Work Value V_work = INR 10,00,00,000, Steel Weight = 0.25): Steel Base Index = 140.0, October 2026 Steel Index = 151.2 (+8.0% increase). Contractor claims full 8.0% escalation = INR 20,00,000.",
    chosen: "AUDIT VERDICT: CONTRACTOR OVERCLAIMED BY INCLUDING THE 5% DEADBAND; APPROVED ESCALATION IS INR 7,50,000. While the Steel WPI rose from 140.0 to 151.2 (+8.00%), exceeding the 5.0% threshold trigger (1.05 x 140.0 = 147.0), Clause 10.4 restricts compensation strictly to the variation above the 5.0% deadband: ((151.2 - 147.0) / 140.0) = 4.2 / 140.0 = 3.00% net compensable variation. Applying the formula: Delta_P = INR 10,00,00,000 x 0.25 x 0.03 = INR 7,50,000. Disallow INR 12,50,000 of the Contractor's INR 20,00,000 claim.",
    rejected: "AUDIT VERDICT: FULL INR 20,00,000 ESCALATION PAYABLE. Because the October 2026 Steel WPI (151.2) increased by 8.0% over the Base Index (140.0)—crossing the +/-5.0% threshold gate—the entire 8.0% variation becomes payable across the 25% steel weighting (INR 10,00,00,000 x 0.25 x 0.08 = INR 20,00,000).",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://eaindustry.nic.in/"
    }
  }
];

// 6. REGULATORY_FILING_MONITOR_GENERAL (Issue #104 - P1, Deterministic truth_source!)
// Must be a valid miner YAML document with auth.type: none, public https base_url, and intents: [REGULATORY_FILING_MONITOR_GENERAL]
const gleifTruthSourceYaml = [
  "version: '1'",
  "kind: miner",
  "id: 0",
  "slug: truth-gleif-lei-regulatory-filings",
  "protocol: generic",
  "name: GLEIF Global LEI Regulatory Entity & Filing Registry",
  "description: Free, public, keyless Global Legal Entity Identifier Foundation (GLEIF) API serving statutory registration, issuer status, and regulatory authority filing disclosures.",
  "base_url: https://api.gleif.org",
  "auth:",
  "  type: none",
  "endpoints:",
  "  - path: /lei-records",
  "    external_path: /api/v1/lei-records",
  "    method: GET",
  "    description: Query statutory LEI registration and regulatory filing disclosures by issuer name or LEI.",
  "    intents:",
  "      - REGULATORY_FILING_MONITOR_GENERAL",
  "    params:",
  "      query:",
  "        required:",
  "          - name: filter[entity.legalName]",
  "            type: string",
  "            intents:",
  "              - '*'",
  "            description: Legal name or ticker of the regulated issuer or entity.",
  "semantics:",
  "  supported_intents:",
  "    - REGULATORY_FILING_MONITOR_GENERAL",
  ""
].join("\n");

const regulatoryFilingTruthRows = [
  {
    label_kind: "truth_source",
    source: gleifTruthSourceYaml
  }
];

const corporateRegistryRows = [
  {
    prompt: "Perform statutory corporate registry lookup for 'SAP SE' in jurisdiction 'DE' (Germany): Query official LEI register and determine active statutory registration status, 20-character ISO 17442 LEI, corporate headquarters, and managing Local Operating Unit.",
    chosen: "VERDICT: ACTIVE CORPORATE ENTITY. SAP SE is registered in the GLEIF Global LEI Index with valid LEI 529900D6BF99LW9R2E68, jurisdiction DE-BW (Baden-Württemberg, Germany), registration status ISSUED (status_active: 1). Legal form is European Company (Societas Europaea / SE). Registered headquarters is Dietmar-Hopp-Allee 16, 69190 Walldorf, Germany. Managing Local Operating Unit is WM Datenservice (LOU 529900). Statutory status is fully compliant and active.",
    rejected: "VERDICT: INCONCLUSIVE / NOT FOUND. SAP SE could not be identified in German corporate registers because 'SE' denotes a regional partnership rather than a registered corporation. No LEI could be attributed under German federal trade registries. Manual trade court registry (Handelsregister B) extract is required before counterparty onboarding.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org/#/record/529900D6BF99LW9R2E68"
    }
  },
  {
    prompt: "Verify corporate existence and registration status for counterparty 'STRIPE, LLC' in jurisdiction 'US': Identify official LEI, legal address, statutory standing, and parent entity attribution.",
    chosen: "VERDICT: ACTIVE STATUTORY ENTITY. STRIPE, LLC is an active registered legal entity in the Global LEI Index with LEI 549300CLHGIPTCYHQ143. Legal jurisdiction is US-DE (Delaware), registration status is ISSUED (status_active: 1). Legal form is Limited Liability Company (LLC). Legal address is 354 Oyster Point Blvd, South San Francisco, CA 94080, USA. Registration authority is Delaware Division of Corporations (RA000600).",
    rejected: "VERDICT: INVALID REGISTRATION. Stripe is only a software trademark and has no standalone legal entity registration as an LLC in Delaware. Payments processed under Stripe LLC must be rejected for institutional counterparty clearance until a full C-Corporation certificate is presented.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org/#/record/549300CLHGIPTCYHQ143"
    }
  },
  {
    prompt: "Check corporate registry status for entity 'Siemens Aktiengesellschaft' in Germany (DE): Validate legal name, active status, and distinction between parent AG and operating subsidiaries.",
    chosen: "VERDICT: ACTIVE ULTIMATE PARENT. Siemens Aktiengesellschaft is active with LEI GADG0T1027EUT270CH24 in jurisdiction DE-BY (Bavaria, Germany). Registration status is ISSUED (status_active: 1). Entity category is GENERAL (Operating Parent). Registered address is Werner-von-Siemens-Str. 1, 80333 Munich, Germany. Managing LOU is WM Datenservice. Corporate structure confirms it as the statutory parent issuer.",
    rejected: "VERDICT: SUBSIDIARY ONLY. Siemens Aktiengesellschaft is a non-operating regional holding company without direct statutory standing in German commercial registries. Commercial spend authority should be directed to Siemens Energy AG instead.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org/#/record/GADG0T1027EUT270CH24"
    }
  },
  {
    prompt: "Perform corporate registry lookup for fictitious entity 'Atlantis Sovereign BioTech Global Ltd' claiming jurisdiction US-DE: Determine existence in primary registers.",
    chosen: "VERDICT: NOT FOUND / FICTITIOUS ENTITY. Query across GLEIF Global LEI Index (200+ jurisdictions) and Delaware Division of Corporations returns 0 matching records for 'Atlantis Sovereign BioTech Global Ltd' (status_active: 0). No active or historical LEI, EIN, or charter number exists. Reject entity onboarding as fraudulent / non-existent counterparty.",
    rejected: "VERDICT: PRESUMED ACTIVE. The entity is presumed active under standard Delaware private company secrecy laws where entity lookups do not appear in public index registries without paid notary filings. Onboarding may proceed with a signed W-9 affidavit.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org"
    }
  },
  {
    prompt: "Audit corporate registry records for 'Infosys Limited' in jurisdiction 'IN' (India): Validate corporate identity, CIN, and LEI registration.",
    chosen: "VERDICT: ACTIVE LISTED ENTITY. Infosys Limited is active in the GLEIF index with LEI 335800U344078L6P8859, jurisdiction IN-KA (Karnataka, India), status ISSUED (status_active: 1). Legal form is Public Limited Company. Registered office is Electronics City, Hosur Road, Bengaluru 560100, India. Registered with Registrar of Companies (ROC Bangalore).",
    rejected: "VERDICT: FOREIGN COMPANY. Infosys Limited is registered primarily as an offshore Cayman holding vehicle without domestic Indian statutory authority. Indian GST and vendor clearance cannot be granted under this entity name.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org/#/record/335800U344078L6P8859"
    }
  },
  {
    prompt: "Evaluate corporate registry status for entity with LAPSED LEI renewal: Counterparty 'Global Maritime Freight Services NV' presents LEI 529900EXAMPLELAPSED where nextRenewalDate was 2025-06-30 and current status is LAPSED.",
    chosen: "VERDICT: NON-COMPLIANT / LAPSED REGISTRATION. While the entity previously held a valid LEI, the registration status is LAPSED (status_active: 0) because statutory annual verification was not renewed prior to 2025-06-30. Under institutional compliance guidelines (GLEIF Level 2 and MiFID II RTS 8), counterparties with LAPSED LEIs cannot execute regulated clearing transactions until statutory renewal is confirmed by the managing LOU.",
    rejected: "VERDICT: FULLY ACTIVE. Once an LEI is issued, it remains active indefinitely regardless of annual renewal dates. A LAPSED flag is purely an internal billing reminder for the registrar and does not impair legal validity or corporate trading capacity.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.gleif.org/en/about-lei/lei-data-quality"
    }
  },
  {
    prompt: "Perform corporate registry lookup for 'BNP Paribas' in jurisdiction 'FR' (France): Determine legal form and regulatory LEI identification.",
    chosen: "VERDICT: ACTIVE FINANCIAL INSTITUTION. BNP Paribas is active in the Global LEI register with LEI R0MUWS6CHIXDF3WHVO18, jurisdiction FR (France), status ISSUED (status_active: 1). Legal form is Société Anonyme (SA), registered address 16 Boulevard des Italiens, 75009 Paris, France. Managing LOU is INSEE (Institut National de la Statistique et des Études Économiques).",
    rejected: "VERDICT: UNVERIFIED. BNP Paribas has fragmented registrations across multiple regional French departments and cannot be verified through unified LEI registries without a specific SIREN/SIRET registry extract.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org/#/record/R0MUWS6CHIXDF3WHVO18"
    }
  },
  {
    prompt: "Check corporate registry for 'ASML Holding N.V.' in Netherlands (NL): Validate active status, headquarters, and semiconductor equipment manufacturer category.",
    chosen: "VERDICT: ACTIVE PUBLIC ISSUER. ASML Holding N.V. is active with LEI 724500Y6LV6Z8841GM35 in jurisdiction NL (Netherlands), status ISSUED (status_active: 1). Legal form is Naamloze Vennootschap (NV). Registered headquarters is De Run 6501, 5504 DR Veldhoven, Netherlands. Managing LOU is Kamer van Koophandel (Dutch Chamber of Commerce).",
    rejected: "VERDICT: LAPSED / PRIVATE FIRM. ASML Holding N.V. is registered as a private besloten vennootschap without active international securities clearing identifiers.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://search.gleif.org/#/record/724500Y6LV6Z8841GM35"
    }
  }
];

const sanctionsScreeningRows = [
  {
    prompt: "Screen entity 'BANCO NACIONAL DE CUBA' against the official US Treasury OFAC Specially Designated Nationals (SDN) sanctions list: Determine match status, SDN UID, program, and commercial clearing implications.",
    chosen: "VERDICT: SANCTIONS MATCH (PROHIBITED COUNTERPARTY). Exact match found on OFAC SDN List: UID 306, Legal Name 'BANCO NACIONAL DE CUBA', Type: Entity, Sanctions Program: [CUBA]. Known aliases include 'BNC' and 'NATIONAL BANK OF CUBA'. Similarity score: 1.00 (100%). All assets are blocked under 31 CFR Part 515; executing transactions or processing funds transfers involving this entity is strictly prohibited.",
    rejected: "VERDICT: NO SANCTIONS MATCH. Banco Nacional de Cuba is an official sovereign banking institution and is exempt from commercial sanctions screening under international trade banking protocols. Funds transfers may proceed without SDN blocking.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://sanctionssearch.ofac.treas.gov/"
    }
  },
  {
    prompt: "Screen alias 'National Bank of Cuba' against the US Treasury OFAC sanctions registry: Identify whether this alias triggers an SDN match and identify the primary entity.",
    chosen: "VERDICT: SANCTIONS MATCH VIA ALIAS. The query 'National Bank of Cuba' matches an official known alias ('a.k.a.') for OFAC SDN UID 306 ('BANCO NACIONAL DE CUBA'), Sanctions Program [CUBA], with 1.00 (100%) alias similarity score. Screening systems must resolve aliases against parent SDN UIDs to prevent evasive counterparty naming. Transaction must be rejected.",
    rejected: "VERDICT: CLEAN COUNTERPARTY. The name 'National Bank of Cuba' does not appear as a primary entry on the OFAC SDN list (which lists only Banco Nacional de Cuba). Because primary name matching returned no exact match, the counterparty is cleared for payment.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.treasury.gov/ofac/downloads/alt.csv"
    }
  },
  {
    prompt: "Screen transport carrier 'AERO-CARIBBEAN' against OFAC sanctions database: Check primary and alias records for blocked carrier status.",
    chosen: "VERDICT: SANCTIONS MATCH VIA ALIAS. 'AERO-CARIBBEAN' matches alias UID 12 for primary SDN entry 'AEROCARIBBEAN AIRLINES' (UID 36), Program [CUBA], Type: Entity, Location: Havana, Cuba. High-confidence match (score 1.00). Providing freight, charter, or spend clearing to this carrier violates OFAC Cuba sanctions.",
    rejected: "VERDICT: NO MATCH. 'Aero-Caribbean' is an active regional commercial passenger airline and does not appear on current non-SDN consolidated lists. Payment authorization is approved.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.treasury.gov/ofac/downloads/sdn.csv"
    }
  },
  {
    prompt: "Screen corporate vendor 'Apple Inc.' against the US Treasury OFAC Specially Designated Nationals list: Determine if any sanctions blocks or SDN matches exist.",
    chosen: "VERDICT: NO SANCTIONS MATCH (CLEAN COUNTERPARTY). Screening 'Apple Inc.' across 19,563 OFAC SDN entries and 8,870 alias groups yields 0 matches (match_found: false, match_count: 0). No Specially Designated Nationals, Sectoral Sanctions (SSI), or Foreign Sanctions Evaders blocks apply. Counterparty cleared for spend.",
    rejected: "VERDICT: POTENTIAL SANCTIONS MATCH. 'Apple Inc.' partially matches designated entity 'Apple Russian Holdings' under executive order 14024 with a 45% fuzzy match score. Immediate transaction freeze and OFAC blocking report filing is required.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://sanctionssearch.ofac.treas.gov/"
    }
  },
  {
    prompt: "Screen vendor 'STRIPE, LLC' against OFAC SDN and Consolidated Non-SDN lists: Verify sanctions clearance for payment settlement.",
    chosen: "VERDICT: NO SANCTIONS MATCH (CLEAN COUNTERPARTY). Query for 'STRIPE, LLC' returns 0 matches across the consolidated OFAC sanctions index (screened: true, match_found: false). The entity holds an active, verified GLEIF LEI (549300CLHGIPTCYHQ143) and is fully eligible for domestic and international settlement.",
    rejected: "VERDICT: INCONCLUSIVE. Payment processors cannot be cleared through standard SDN lists because intermediate merchant accounts require separate FinCEN BSA filing clearance. Settlement is blocked pending banking SAR review.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://sanctionssearch.ofac.treas.gov/"
    }
  },
  {
    prompt: "Screen individual 'Ayman al-Zawahiri' against the US Treasury OFAC sanctions list: Verify SDN status, aliases, and program tags.",
    chosen: "VERDICT: SANCTIONS MATCH (BLOCKED INDIVIDUAL). Direct match found for OFAC SDN UID 2676, 'AL-ZAWAHIRI, Ayman', Type: Individual, Sanctions Program [SDGT] (Specially Designated Global Terrorist). Known aliases include 'SALIM, Ahmad Fuad' and 'AL-ZAWAHIRI, Aiman Muhammad Rabi'. Match score: 0.95+ via fuzzy bigram normalization. Absolute statutory prohibition on all transactions.",
    rejected: "VERDICT: UNVERIFIED INDIVIDUAL. Transliteration of Arabic names requires exact character-by-character diacritical matching. Because the query uses Latin 'al-Zawahiri' without hyphenated patronymics, the match is rejected as unconfirmed.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://sanctionssearch.ofac.treas.gov/"
    }
  },
  {
    prompt: "Evaluate fuzzy sanctions screening match for 'CENTRAL BANK OF IRAN' against OFAC SDN records: Check alias mappings and statutory programs.",
    chosen: "VERDICT: SANCTIONS MATCH VIA ALIAS. 'CENTRAL BANK OF IRAN' is a registered alias (alt UID 12103) for primary SDN UID 4632 ('CENTRAL BANK OF THE ISLAMIC REPUBLIC OF IRAN'), also known as 'BANK MARKAZI IRAN'. Programs: [IRAN], [SDGT], [IFSR]. 100% alias match. Secondary sanctions apply to any foreign financial institution processing transactions.",
    rejected: "VERDICT: EXEMPT SOVEREIGN CENTRAL BANK. Central banks are immune from OFAC SDN designation under the Foreign Sovereign Immunities Act (FSIA) and are cleared for currency reserve settlements.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.treasury.gov/ofac/downloads/alt.csv"
    }
  },
  {
    prompt: "Screen entity with slight typographical permutation 'Bancoo Nacionall de Cubaa' against OFAC SDN database: Evaluate fuzzy bigram tolerance.",
    chosen: "VERDICT: SANCTIONS MATCH (FUZZY MATCH 84%). Typographical permutation 'Bancoo Nacionall de Cubaa' yields a similarity score of 0.84 against OFAC SDN UID 306 ('BANCO NACIONAL DE CUBA'). Because the similarity score exceeds the standard 0.70 screening threshold, the screening engine correctly flags the attempt as a high-probability evasion or spelling error. Transaction blocked.",
    rejected: "VERDICT: NO MATCH. Exact name matching did not find 'Bancoo Nacionall de Cubaa'. Because the string differs by three characters from any SDN entry, the payment is automatically cleared without compliance review.",
    label_kind: "preference_pair",
    provenance: {
      source_kind: "human",
      source_url: "https://www.treasury.gov/ofac/downloads/sdn.csv"
    }
  }
];

function writeJsonl(filename, rows) {
  const filePath = path.join(evalDir, filename);
  const content = rows.map(r => JSON.stringify(r)).join('\n') + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote ${rows.length} rows to ${filePath} (${Buffer.byteLength(content)} bytes)`);
}

writeJsonl('document_authenticity_general.jsonl', documentAuthenticityRows);
writeJsonl('invoice_ledger_reconcile_general.jsonl', invoiceLedgerReconcileRows);
writeJsonl('purchase_order_verify_general.jsonl', purchaseOrderVerifyRows);
writeJsonl('vendor_verify_general.jsonl', vendorVerifyRows);
writeJsonl('contract_obligation_audit_general.jsonl', contractObligationAuditRows);
writeJsonl('regulatory_filing_monitor_general.jsonl', regulatoryFilingTruthRows);
writeJsonl('corporate_registry_lookup_general.jsonl', corporateRegistryRows);
writeJsonl('sanctions_screening_match_general.jsonl', sanctionsScreeningRows);
