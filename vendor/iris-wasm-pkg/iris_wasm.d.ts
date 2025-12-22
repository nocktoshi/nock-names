/* tslint:disable */
/* eslint-disable */
/**
 * Derive master key from seed bytes
 */
export function deriveMasterKey(seed: Uint8Array): ExtendedKey;
/**
 * Derive master key from BIP39 mnemonic phrase
 */
export function deriveMasterKeyFromMnemonic(mnemonic: string, passphrase?: string | null): ExtendedKey;
/**
 * Hash a public key to get its digest (for use in PKH)
 */
export function hashPublicKey(public_key_bytes: Uint8Array): string;
/**
 * Hash a u64 value
 */
export function hashU64(value: bigint): string;
/**
 * Hash a noun (jam as input)
 */
export function hashNoun(noun: Uint8Array): string;
/**
 * Sign a message string with a private key
 */
export function signMessage(private_key_bytes: Uint8Array, message: string): Signature;
/**
 * Verify a signature with a public key
 */
export function verifySignature(public_key_bytes: Uint8Array, signature: Signature, message: string): boolean;
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
export class Digest {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): Digest;
  constructor(value: string);
  readonly value: string;
}
export class ExtendedKey {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Derive a child key at the given index
   */
  deriveChild(index: number): ExtendedKey;
  readonly chainCode: Uint8Array;
  readonly publicKey: Uint8Array;
  readonly privateKey: Uint8Array | undefined;
}
export class GrpcClient {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Send a transaction
   */
  sendTransaction(raw_tx: any): Promise<any>;
  /**
   * Check if a transaction was accepted
   */
  transactionAccepted(tx_id: string): Promise<boolean>;
  /**
   * Get balance for a wallet address
   */
  getBalanceByAddress(address: string): Promise<any>;
  /**
   * Get balance for a first name
   */
  getBalanceByFirstName(first_name: string): Promise<any>;
  constructor(endpoint: string);
}
export class Hax {
  free(): void;
  [Symbol.dispose](): void;
  constructor(digests: Digest[]);
  readonly digests: Digest[];
}
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  start(controller: ReadableByteStreamController): void;
  cancel(): void;
  readonly autoAllocateChunkSize: number;
  readonly type: ReadableStreamType;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  abort(reason: any): Promise<any>;
  close(): Promise<any>;
  write(chunk: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}
export class LockPrimitive {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): LockPrimitive;
  static newBrn(): LockPrimitive;
  static newHax(hax: Hax): LockPrimitive;
  static newPkh(pkh: Pkh): LockPrimitive;
  static newTim(tim: LockTim): LockPrimitive;
}
export class LockRoot {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static fromSpendCondition(cond: SpendCondition): LockRoot;
  static fromHash(hash: Digest): LockRoot;
  readonly hash: Digest;
  readonly lock: SpendCondition | undefined;
}
export class LockTim {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): LockTim;
  constructor(rel: TimelockRange, abs: TimelockRange);
  static coinbase(): LockTim;
  readonly abs: TimelockRange;
  readonly rel: TimelockRange;
}
export class Name {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): Name;
  constructor(first: string, last: string);
  readonly last: string;
  readonly first: string;
}
export class NockchainTx {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Convert to jammed transaction file for inspecting through CLI
   */
  toJam(): Uint8Array;
  outputs(): Note[];
  /**
   * Convert from CLI-compatible jammed transaction file
   */
  static fromJam(jam: Uint8Array): NockchainTx;
  toRawTx(): RawTx;
  readonly id: Digest;
  readonly name: string;
  readonly version: Version;
}
export class Note {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  /**
   * Create a WasmNote from a protobuf Note object (from get_balance response)
   * Expects response.notes[i].note (handles version internally)
   */
  static fromProtobuf(pb_note: any): Note;
  constructor(version: Version, origin_page: bigint, name: Name, note_data: NoteData, assets: bigint);
  hash(): Digest;
  readonly originPage: bigint;
  readonly name: Name;
  readonly assets: bigint;
  readonly version: Version;
  readonly noteData: NoteData;
}
export class NoteData {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): NoteData;
  constructor(entries: NoteDataEntry[]);
  static empty(): NoteData;
  static fromPkh(pkh: Pkh): NoteData;
  readonly entries: NoteDataEntry[];
}
export class NoteDataEntry {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): NoteDataEntry;
  constructor(key: string, blob: Uint8Array);
  readonly key: string;
  readonly blob: Uint8Array;
}
export class Noun {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static cue(jam: Uint8Array): Noun;
  jam(): Uint8Array;
  static fromJs(value: any): Noun;
  toJs(): any;
}
export class Pkh {
  free(): void;
  [Symbol.dispose](): void;
  toProtobuf(): any;
  static fromProtobuf(value: any): Pkh;
  constructor(m: bigint, hashes: string[]);
  static single(hash: string): Pkh;
  readonly m: bigint;
  readonly hashes: string[];
}
export class RawTx {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Convert to protobuf RawTransaction for sending via gRPC
   */
  toProtobuf(): any;
  static fromProtobuf(value: any): RawTx;
  toNockchainTx(): NockchainTx;
  /**
   * Convert to jammed transaction file for inspecting through CLI
   */
  toJam(): Uint8Array;
  /**
   * Calculate output notes from the transaction spends.
   */
  outputs(): Note[];
  static fromJam(jam: Uint8Array): RawTx;
  readonly id: Digest;
  readonly name: string;
  readonly version: Version;
}
export class Seed {
  free(): void;
  [Symbol.dispose](): void;
  static newSinglePkh(pkh: Digest, gift: bigint, parent_hash: Digest, include_lock_data: boolean, memo?: any | null): Seed;
  constructor(output_source: Source | null | undefined, lock_root: LockRoot, gift: bigint, note_data: NoteData, parent_hash: Digest);
  parentHash: Digest;
  get outputSource(): Source | undefined;
  set outputSource(value: Source | null | undefined);
  lockRoot: LockRoot;
  noteData: NoteData;
  gift: bigint;
}
export class Signature {
  free(): void;
  [Symbol.dispose](): void;
  constructor(c: Uint8Array, s: Uint8Array);
  readonly c: Uint8Array;
  readonly s: Uint8Array;
}
export class Source {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly isCoinbase: boolean;
  readonly hash: Digest;
}
export class SpendBuilder {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get current refund
   */
  curRefund(): Seed | undefined;
  /**
   * Checks whether note.assets = seeds + fee
   *
   * This function needs to return true for `TxBuilder::validate` to pass
   */
  isBalanced(): boolean;
  /**
   * Attatch a preimage to this spend
   */
  addPreimage(preimage_jam: Uint8Array): Digest | undefined;
  /**
   * Compute refund from any spare assets, given `refund_lock` was passed
   */
  computeRefund(include_lock_data: boolean): void;
  /**
   * Manually invalidate signatures
   *
   * Each spend's fee+seeds are bound to one or more signatures. If they get changed, the
   * signature becomes invalid. This builder automatically invalidates signatures upon relevant
   * modifications, but this functionality is provided nonetheless.
   */
  invalidateSigs(): void;
  /**
   * Get the list of missing "unlocks"
   *
   * An unlock is a spend condition to be satisfied. For instance, for a `Pkh` spend condition,
   * if the transaction is unsigned, this function will return a Pkh type missing unlock, with
   * the list of valid PKH's and number of signatures needed. This will not return PKHs that are
   * already attatched to the spend (relevant for multisigs). For `Hax` spend condition, this
   * will return any missing preimages. This function will return a list of not-yet-validated
   * spend conditions.
   */
  missingUnlocks(): any[];
  /**
   * Set the fee of this spend
   */
  fee(fee: bigint): void;
  /**
   * Create a new `SpendBuilder` with a given note and spend condition
   */
  constructor(note: Note, spend_condition: SpendCondition, refund_lock?: SpendCondition | null);
  /**
   * Add seed to this spend
   *
   * Seed is an output with a recipient (as defined by the spend condition).
   *
   * Nockchain transaction engine will take all seeds with matching lock from all spends in the
   * transaction, and merge them into one output note.
   */
  seed(seed: Seed): void;
  /**
   * Sign the transaction with a given private key
   */
  sign(signing_key_bytes: Uint8Array): boolean;
}
export class SpendCondition {
  free(): void;
  [Symbol.dispose](): void;
  firstName(): Digest;
  toProtobuf(): any;
  static fromProtobuf(value: any): SpendCondition;
  constructor(primitives: LockPrimitive[]);
  hash(): Digest;
  static newPkh(pkh: Pkh): SpendCondition;
}
export class TimelockRange {
  free(): void;
  [Symbol.dispose](): void;
  constructor(min?: bigint | null, max?: bigint | null);
  readonly max: bigint | undefined;
  readonly min: bigint | undefined;
}
export class TxBuilder {
  free(): void;
  [Symbol.dispose](): void;
  allSpends(): SpendBuilder[];
  /**
   * Appends `preimage_jam` to all spend conditions that expect this preimage.
   */
  addPreimage(preimage_jam: Uint8Array): Digest | undefined;
  /**
   * Perform a simple-spend on this builder.
   *
   * It is HIGHLY recommended to not mix `simpleSpend` with other types of spends.
   *
   * This performs a fairly complex set of operations, in order to mimic behavior of nockchain
   * CLI wallet's create-tx option. Note that we do not do 1-1 mapping of that functionality,
   * most notably - if `recipient` is the same as `refund_pkh`, we will create 1 seed, while the
   * CLI wallet will create 2.
   *
   * Another difference is that you should call `sign` and `validate` after calling this method.
   *
   * Internally, the transaction builder takes ALL of the `notes` provided, and stores them for
   * fee adjustments. If there are multiple notes being used, our fee setup also differs from
   * the CLI, because we first greedily spend the notes out, and then take fees from any
   * remaining refunds.
   *
   * This function prioritizes using the least number of notes possible, because that lowers the
   * fee used.
   *
   * You may choose to override the fee with `fee_override`, but do note that `validate` will
   * fail, in case this fee is too small.
   *
   * `include_lock_data` can be used to include `%lock` key in note-data, with the
   * `SpendCondition` used. However, note-data costs 1 << 15 nicks, which means, it can get
   * expensive.
   */
  simpleSpend(notes: Note[], spend_conditions: SpendCondition[], recipient: Digest, gift: bigint, fee_override: bigint | null | undefined, refund_pkh: Digest, include_lock_data: boolean, memo?: any | null): void;
  /**
   * Recalculate fee and set it, balancing things out with refunds
   */
  recalcAndSetFee(include_lock_data: boolean): void;
  /**
   * Distributes `fee` across builder's spends, and balances refunds out
   *
   * `adjust_fee` parameter allows the fee to be slightly tweaked, whenever notes are added or
   * removed to/from the builder's fee note pool. This is because using more or less notes
   * impacts the exact fee being required. If the caller estimates fee and sets it, adding more
   * notes will change the exact fee needed, and setting this parameter to true will allow one
   * to not have to call this function multiple times.
   */
  setFeeAndBalanceRefund(fee: bigint, adjust_fee: boolean, include_lock_data: boolean): void;
  /**
   * Create an empty transaction builder
   */
  constructor(fee_per_word: bigint);
  /**
   * Sign the transaction with a private key.
   *
   * This will sign all spends that are still missing signature from
   */
  sign(signing_key_bytes: Uint8Array): void;
  build(): NockchainTx;
  /**
   * Append a `SpendBuilder` to this transaction
   */
  spend(spend: SpendBuilder): SpendBuilder | undefined;
  /**
   * Gets the current fee set on all spends.
   */
  curFee(): bigint;
  /**
   * Reconstruct a builder from raw transaction and its input notes.
   *
   * To get the builder back, you must pass the notes and their corresponding spend conditions.
   * If serializing the builder, call `WasmTxBuilder::all_notes`.
   */
  static fromTx(tx: RawTx, notes: Note[], spend_conditions: SpendCondition[]): TxBuilder;
  /**
   * Calculates the fee needed for the transaction.
   *
   * NOTE: if the transaction is unsigned, this function will estimate the fee needed, supposing
   * all signatures are added. However, this heuristic is only accurate for one signature. In
   * addition, this fee calculation does not estimate the size of missing preimages.
   *
   * So, first, add missing preimages, and only then calc the fee. If you're building a multisig
   * transaction, this value might be incorrect.
   */
  calcFee(): bigint;
  /**
   * Validate the transaction.
   */
  validate(): void;
  allNotes(): TxNotes;
}
export class TxNotes {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly spendConditions: SpendCondition[];
  readonly notes: Note[];
}
export class Version {
  free(): void;
  [Symbol.dispose](): void;
  static V0(): Version;
  static V1(): Version;
  static V2(): Version;
  constructor(version: number);
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_digest_free: (a: number, b: number) => void;
  readonly __wbg_hax_free: (a: number, b: number) => void;
  readonly __wbg_lockprimitive_free: (a: number, b: number) => void;
  readonly __wbg_lockroot_free: (a: number, b: number) => void;
  readonly __wbg_locktim_free: (a: number, b: number) => void;
  readonly __wbg_name_free: (a: number, b: number) => void;
  readonly __wbg_nockchaintx_free: (a: number, b: number) => void;
  readonly __wbg_note_free: (a: number, b: number) => void;
  readonly __wbg_notedata_free: (a: number, b: number) => void;
  readonly __wbg_notedataentry_free: (a: number, b: number) => void;
  readonly __wbg_pkh_free: (a: number, b: number) => void;
  readonly __wbg_rawtx_free: (a: number, b: number) => void;
  readonly __wbg_seed_free: (a: number, b: number) => void;
  readonly __wbg_source_free: (a: number, b: number) => void;
  readonly __wbg_spendbuilder_free: (a: number, b: number) => void;
  readonly __wbg_spendcondition_free: (a: number, b: number) => void;
  readonly __wbg_timelockrange_free: (a: number, b: number) => void;
  readonly __wbg_txbuilder_free: (a: number, b: number) => void;
  readonly __wbg_txnotes_free: (a: number, b: number) => void;
  readonly __wbg_version_free: (a: number, b: number) => void;
  readonly digest_fromProtobuf: (a: any) => [number, number, number];
  readonly digest_new: (a: number, b: number) => number;
  readonly digest_toProtobuf: (a: number) => [number, number, number];
  readonly digest_value: (a: number) => [number, number];
  readonly hax_digests: (a: number) => [number, number];
  readonly hax_new: (a: number, b: number) => number;
  readonly lockprimitive_fromProtobuf: (a: any) => [number, number, number];
  readonly lockprimitive_newBrn: () => number;
  readonly lockprimitive_newHax: (a: number) => number;
  readonly lockprimitive_newPkh: (a: number) => number;
  readonly lockprimitive_newTim: (a: number) => number;
  readonly lockprimitive_toProtobuf: (a: number) => [number, number, number];
  readonly lockroot_fromHash: (a: number) => [number, number, number];
  readonly lockroot_fromSpendCondition: (a: number) => [number, number, number];
  readonly lockroot_hash: (a: number) => number;
  readonly lockroot_lock: (a: number) => number;
  readonly locktim_abs: (a: number) => number;
  readonly locktim_coinbase: () => number;
  readonly locktim_fromProtobuf: (a: any) => [number, number, number];
  readonly locktim_new: (a: number, b: number) => number;
  readonly locktim_rel: (a: number) => number;
  readonly locktim_toProtobuf: (a: number) => [number, number, number];
  readonly name_first: (a: number) => [number, number];
  readonly name_fromProtobuf: (a: any) => [number, number, number];
  readonly name_last: (a: number) => [number, number];
  readonly name_new: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly name_toProtobuf: (a: number) => [number, number, number];
  readonly nockchaintx_fromJam: (a: number, b: number) => [number, number, number];
  readonly nockchaintx_id: (a: number) => number;
  readonly nockchaintx_name: (a: number) => [number, number];
  readonly nockchaintx_outputs: (a: number) => [number, number];
  readonly nockchaintx_toJam: (a: number) => any;
  readonly nockchaintx_toRawTx: (a: number) => number;
  readonly nockchaintx_version: (a: number) => number;
  readonly note_assets: (a: number) => bigint;
  readonly note_fromProtobuf: (a: any) => [number, number, number];
  readonly note_hash: (a: number) => [number, number, number];
  readonly note_name: (a: number) => number;
  readonly note_new: (a: number, b: bigint, c: number, d: number, e: bigint) => number;
  readonly note_noteData: (a: number) => number;
  readonly note_originPage: (a: number) => bigint;
  readonly note_toProtobuf: (a: number) => [number, number, number];
  readonly note_version: (a: number) => number;
  readonly notedata_empty: () => number;
  readonly notedata_entries: (a: number) => [number, number];
  readonly notedata_fromPkh: (a: number) => [number, number, number];
  readonly notedata_fromProtobuf: (a: any) => [number, number, number];
  readonly notedata_new: (a: number, b: number) => number;
  readonly notedata_toProtobuf: (a: number) => [number, number, number];
  readonly notedataentry_blob: (a: number) => [number, number];
  readonly notedataentry_fromProtobuf: (a: any) => [number, number, number];
  readonly notedataentry_key: (a: number) => [number, number];
  readonly notedataentry_new: (a: number, b: number, c: number, d: number) => number;
  readonly notedataentry_toProtobuf: (a: number) => [number, number, number];
  readonly pkh_fromProtobuf: (a: any) => [number, number, number];
  readonly pkh_hashes: (a: number) => [number, number];
  readonly pkh_m: (a: number) => bigint;
  readonly pkh_new: (a: bigint, b: number, c: number) => number;
  readonly pkh_single: (a: number, b: number) => number;
  readonly pkh_toProtobuf: (a: number) => [number, number, number];
  readonly rawtx_fromJam: (a: number, b: number) => [number, number, number];
  readonly rawtx_fromProtobuf: (a: any) => [number, number, number];
  readonly rawtx_id: (a: number) => number;
  readonly rawtx_name: (a: number) => [number, number];
  readonly rawtx_outputs: (a: number) => [number, number];
  readonly rawtx_toJam: (a: number) => any;
  readonly rawtx_toNockchainTx: (a: number) => number;
  readonly rawtx_toProtobuf: (a: number) => [number, number, number];
  readonly rawtx_version: (a: number) => number;
  readonly seed_gift: (a: number) => bigint;
  readonly seed_lockRoot: (a: number) => number;
  readonly seed_new: (a: number, b: number, c: bigint, d: number, e: number) => number;
  readonly seed_newSinglePkh: (a: number, b: bigint, c: number, d: number, e: number) => [number, number, number];
  readonly seed_noteData: (a: number) => number;
  readonly seed_outputSource: (a: number) => number;
  readonly seed_parentHash: (a: number) => number;
  readonly seed_set_gift: (a: number, b: bigint) => void;
  readonly seed_set_lockRoot: (a: number, b: number) => void;
  readonly seed_set_noteData: (a: number, b: number) => void;
  readonly seed_set_outputSource: (a: number, b: number) => void;
  readonly seed_set_parentHash: (a: number, b: number) => void;
  readonly source_hash: (a: number) => number;
  readonly source_isCoinbase: (a: number) => number;
  readonly spendbuilder_addPreimage: (a: number, b: number, c: number) => [number, number, number];
  readonly spendbuilder_computeRefund: (a: number, b: number) => void;
  readonly spendbuilder_curRefund: (a: number) => number;
  readonly spendbuilder_fee: (a: number, b: bigint) => void;
  readonly spendbuilder_invalidateSigs: (a: number) => void;
  readonly spendbuilder_isBalanced: (a: number) => number;
  readonly spendbuilder_missingUnlocks: (a: number) => [number, number, number, number];
  readonly spendbuilder_new: (a: number, b: number, c: number) => [number, number, number];
  readonly spendbuilder_seed: (a: number, b: number) => [number, number];
  readonly spendbuilder_sign: (a: number, b: number, c: number) => [number, number, number];
  readonly spendcondition_firstName: (a: number) => [number, number, number];
  readonly spendcondition_fromProtobuf: (a: any) => [number, number, number];
  readonly spendcondition_hash: (a: number) => [number, number, number];
  readonly spendcondition_new: (a: number, b: number) => number;
  readonly spendcondition_newPkh: (a: number) => number;
  readonly spendcondition_toProtobuf: (a: number) => [number, number, number];
  readonly timelockrange_max: (a: number) => [number, bigint];
  readonly timelockrange_min: (a: number) => [number, bigint];
  readonly timelockrange_new: (a: number, b: bigint, c: number, d: bigint) => number;
  readonly txbuilder_addPreimage: (a: number, b: number, c: number) => [number, number, number];
  readonly txbuilder_allNotes: (a: number) => number;
  readonly txbuilder_allSpends: (a: number) => [number, number];
  readonly txbuilder_build: (a: number) => [number, number, number];
  readonly txbuilder_calcFee: (a: number) => bigint;
  readonly txbuilder_curFee: (a: number) => bigint;
  readonly txbuilder_fromTx: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly txbuilder_new: (a: bigint) => number;
  readonly txbuilder_recalcAndSetFee: (a: number, b: number) => [number, number];
  readonly txbuilder_setFeeAndBalanceRefund: (a: number, b: bigint, c: number, d: number) => [number, number];
  readonly txbuilder_sign: (a: number, b: number, c: number) => [number, number];
  readonly txbuilder_simpleSpend: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number, i: bigint, j: number, k: number, l: number) => [number, number];
  readonly txbuilder_spend: (a: number, b: number) => number;
  readonly txbuilder_validate: (a: number) => [number, number];
  readonly txnotes_notes: (a: number) => [number, number];
  readonly txnotes_spendConditions: (a: number) => [number, number];
  readonly version_V0: () => number;
  readonly version_V1: () => number;
  readonly version_V2: () => number;
  readonly wasmseed_fromProtobuf: (a: any) => [number, number, number];
  readonly wasmseed_toProtobuf: (a: number) => [number, number, number];
  readonly version_new: (a: number) => number;
  readonly __wbg_extendedkey_free: (a: number, b: number) => void;
  readonly __wbg_noun_free: (a: number, b: number) => void;
  readonly __wbg_signature_free: (a: number, b: number) => void;
  readonly deriveMasterKey: (a: number, b: number) => number;
  readonly deriveMasterKeyFromMnemonic: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly extendedkey_chainCode: (a: number) => [number, number];
  readonly extendedkey_deriveChild: (a: number, b: number) => [number, number, number];
  readonly extendedkey_privateKey: (a: number) => [number, number];
  readonly extendedkey_publicKey: (a: number) => [number, number];
  readonly hashNoun: (a: number, b: number) => [number, number, number, number];
  readonly hashPublicKey: (a: number, b: number) => [number, number, number, number];
  readonly hashU64: (a: bigint) => [number, number];
  readonly noun_cue: (a: number, b: number) => [number, number, number];
  readonly noun_fromJs: (a: any) => [number, number, number];
  readonly noun_jam: (a: number) => [number, number, number, number];
  readonly noun_toJs: (a: number) => [number, number, number];
  readonly signMessage: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly signature_c: (a: number) => [number, number];
  readonly signature_new: (a: number, b: number, c: number, d: number) => number;
  readonly signature_s: (a: number) => [number, number];
  readonly verifySignature: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly __wbg_grpcclient_free: (a: number, b: number) => void;
  readonly grpcclient_getBalanceByAddress: (a: number, b: number, c: number) => any;
  readonly grpcclient_getBalanceByFirstName: (a: number, b: number, c: number) => any;
  readonly grpcclient_new: (a: number, b: number) => number;
  readonly grpcclient_sendTransaction: (a: number, b: any) => any;
  readonly grpcclient_transactionAccepted: (a: number, b: number, c: number) => any;
  readonly __wbg_intounderlyingsink_free: (a: number, b: number) => void;
  readonly intounderlyingsink_abort: (a: number, b: any) => any;
  readonly intounderlyingsink_close: (a: number) => any;
  readonly intounderlyingsink_write: (a: number, b: any) => any;
  readonly __wbg_intounderlyingbytesource_free: (a: number, b: number) => void;
  readonly __wbg_intounderlyingsource_free: (a: number, b: number) => void;
  readonly intounderlyingbytesource_autoAllocateChunkSize: (a: number) => number;
  readonly intounderlyingbytesource_cancel: (a: number) => void;
  readonly intounderlyingbytesource_pull: (a: number, b: any) => any;
  readonly intounderlyingbytesource_start: (a: number, b: any) => void;
  readonly intounderlyingbytesource_type: (a: number) => number;
  readonly intounderlyingsource_cancel: (a: number) => void;
  readonly intounderlyingsource_pull: (a: number, b: any) => any;
  readonly wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue_____: (a: number, b: number, c: any) => void;
  readonly wasm_bindgen_9165caa7615cc679___closure__destroy___dyn_core_bb1c441fd6008630___ops__function__FnMut__wasm_bindgen_9165caa7615cc679___JsValue____Output_______: (a: number, b: number) => void;
  readonly wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue__wasm_bindgen_9165caa7615cc679___JsValue_____: (a: number, b: number, c: any, d: any) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
