let wasm;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}
/**
 * Derive master key from seed bytes
 * @param {Uint8Array} seed
 * @returns {ExtendedKey}
 */
export function deriveMasterKey(seed) {
    const ptr0 = passArray8ToWasm0(seed, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deriveMasterKey(ptr0, len0);
    return ExtendedKey.__wrap(ret);
}

/**
 * Derive master key from BIP39 mnemonic phrase
 * @param {string} mnemonic
 * @param {string | null} [passphrase]
 * @returns {ExtendedKey}
 */
export function deriveMasterKeyFromMnemonic(mnemonic, passphrase) {
    const ptr0 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(passphrase) ? 0 : passStringToWasm0(passphrase, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    const ret = wasm.deriveMasterKeyFromMnemonic(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ExtendedKey.__wrap(ret[0]);
}

/**
 * Hash a public key to get its digest (for use in PKH)
 * @param {Uint8Array} public_key_bytes
 * @returns {string}
 */
export function hashPublicKey(public_key_bytes) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(public_key_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.hashPublicKey(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Hash a u64 value
 * @param {bigint} value
 * @returns {string}
 */
export function hashU64(value) {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.hashU64(value);
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * Hash a noun (jam as input)
 * @param {Uint8Array} noun
 * @returns {string}
 */
export function hashNoun(noun) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passArray8ToWasm0(noun, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.hashNoun(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Sign a message string with a private key
 * @param {Uint8Array} private_key_bytes
 * @param {string} message
 * @returns {Signature}
 */
export function signMessage(private_key_bytes, message) {
    const ptr0 = passArray8ToWasm0(private_key_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.signMessage(ptr0, len0, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return Signature.__wrap(ret[0]);
}

/**
 * Verify a signature with a public key
 * @param {Uint8Array} public_key_bytes
 * @param {Signature} signature
 * @param {string} message
 * @returns {boolean}
 */
export function verifySignature(public_key_bytes, signature, message) {
    const ptr0 = passArray8ToWasm0(public_key_bytes, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(signature, Signature);
    const ptr1 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.verifySignature(ptr0, len0, signature.__wbg_ptr, ptr1, len1);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

function wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue_____(arg0, arg1, arg2) {
    wasm.wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue_____(arg0, arg1, arg2);
}

function wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue__wasm_bindgen_9165caa7615cc679___JsValue_____(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue__wasm_bindgen_9165caa7615cc679___JsValue_____(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_ReadableStreamType = ["bytes"];

const __wbindgen_enum_ReferrerPolicy = ["", "no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "unsafe-url", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];

const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const __wbindgen_enum_RequestRedirect = ["follow", "error", "manual"];

const DigestFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_digest_free(ptr >>> 0, 1));

export class Digest {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Digest.prototype);
        obj.__wbg_ptr = ptr;
        DigestFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Digest)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        DigestFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_digest_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.digest_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {Digest}
     */
    static fromProtobuf(value) {
        const ret = wasm.digest_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Digest.__wrap(ret[0]);
    }
    /**
     * @param {string} value
     */
    constructor(value) {
        const ptr0 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.digest_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        DigestFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get value() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.digest_value(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) Digest.prototype[Symbol.dispose] = Digest.prototype.free;

const ExtendedKeyFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_extendedkey_free(ptr >>> 0, 1));

export class ExtendedKey {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ExtendedKey.prototype);
        obj.__wbg_ptr = ptr;
        ExtendedKeyFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ExtendedKeyFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_extendedkey_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    get chainCode() {
        const ret = wasm.extendedkey_chainCode(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get publicKey() {
        const ret = wasm.extendedkey_publicKey(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array | undefined}
     */
    get privateKey() {
        const ret = wasm.extendedkey_privateKey(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * Derive a child key at the given index
     * @param {number} index
     * @returns {ExtendedKey}
     */
    deriveChild(index) {
        const ret = wasm.extendedkey_deriveChild(this.__wbg_ptr, index);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ExtendedKey.__wrap(ret[0]);
    }
}
if (Symbol.dispose) ExtendedKey.prototype[Symbol.dispose] = ExtendedKey.prototype.free;

const GrpcClientFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_grpcclient_free(ptr >>> 0, 1));

export class GrpcClient {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GrpcClientFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_grpcclient_free(ptr, 0);
    }
    /**
     * Send a transaction
     * @param {any} raw_tx
     * @returns {Promise<any>}
     */
    sendTransaction(raw_tx) {
        const ret = wasm.grpcclient_sendTransaction(this.__wbg_ptr, raw_tx);
        return ret;
    }
    /**
     * Check if a transaction was accepted
     * @param {string} tx_id
     * @returns {Promise<boolean>}
     */
    transactionAccepted(tx_id) {
        const ptr0 = passStringToWasm0(tx_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.grpcclient_transactionAccepted(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get balance for a wallet address
     * @param {string} address
     * @returns {Promise<any>}
     */
    getBalanceByAddress(address) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.grpcclient_getBalanceByAddress(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Get balance for a first name
     * @param {string} first_name
     * @returns {Promise<any>}
     */
    getBalanceByFirstName(first_name) {
        const ptr0 = passStringToWasm0(first_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.grpcclient_getBalanceByFirstName(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {string} endpoint
     */
    constructor(endpoint) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.grpcclient_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        GrpcClientFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) GrpcClient.prototype[Symbol.dispose] = GrpcClient.prototype.free;

const HaxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_hax_free(ptr >>> 0, 1));

export class Hax {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        HaxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_hax_free(ptr, 0);
    }
    /**
     * @param {Digest[]} digests
     */
    constructor(digests) {
        const ptr0 = passArrayJsValueToWasm0(digests, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.hax_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        HaxFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Digest[]}
     */
    get digests() {
        const ret = wasm.hax_digests(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) Hax.prototype[Symbol.dispose] = Hax.prototype.free;

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));

export class IntoUnderlyingByteSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, controller);
    }
    /**
     * @returns {ReadableStreamType}
     */
    get type() {
        const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
        return __wbindgen_enum_ReadableStreamType[ret];
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingByteSource.prototype[Symbol.dispose] = IntoUnderlyingByteSource.prototype.free;

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));

export class IntoUnderlyingSink {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, reason);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return ret;
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, chunk);
        return ret;
    }
}
if (Symbol.dispose) IntoUnderlyingSink.prototype[Symbol.dispose] = IntoUnderlyingSink.prototype.free;

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));

export class IntoUnderlyingSource {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingSource.prototype[Symbol.dispose] = IntoUnderlyingSource.prototype.free;

const LockPrimitiveFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_lockprimitive_free(ptr >>> 0, 1));

export class LockPrimitive {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LockPrimitive.prototype);
        obj.__wbg_ptr = ptr;
        LockPrimitiveFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof LockPrimitive)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LockPrimitiveFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_lockprimitive_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.lockprimitive_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {LockPrimitive}
     */
    static fromProtobuf(value) {
        const ret = wasm.lockprimitive_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LockPrimitive.__wrap(ret[0]);
    }
    /**
     * @returns {LockPrimitive}
     */
    static newBrn() {
        const ret = wasm.lockprimitive_newBrn();
        return LockPrimitive.__wrap(ret);
    }
    /**
     * @param {Hax} hax
     * @returns {LockPrimitive}
     */
    static newHax(hax) {
        _assertClass(hax, Hax);
        var ptr0 = hax.__destroy_into_raw();
        const ret = wasm.lockprimitive_newHax(ptr0);
        return LockPrimitive.__wrap(ret);
    }
    /**
     * @param {Pkh} pkh
     * @returns {LockPrimitive}
     */
    static newPkh(pkh) {
        _assertClass(pkh, Pkh);
        var ptr0 = pkh.__destroy_into_raw();
        const ret = wasm.lockprimitive_newPkh(ptr0);
        return LockPrimitive.__wrap(ret);
    }
    /**
     * @param {LockTim} tim
     * @returns {LockPrimitive}
     */
    static newTim(tim) {
        _assertClass(tim, LockTim);
        var ptr0 = tim.__destroy_into_raw();
        const ret = wasm.lockprimitive_newTim(ptr0);
        return LockPrimitive.__wrap(ret);
    }
}
if (Symbol.dispose) LockPrimitive.prototype[Symbol.dispose] = LockPrimitive.prototype.free;

const LockRootFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_lockroot_free(ptr >>> 0, 1));

export class LockRoot {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LockRoot.prototype);
        obj.__wbg_ptr = ptr;
        LockRootFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LockRootFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_lockroot_free(ptr, 0);
    }
    /**
     * @param {SpendCondition} cond
     * @returns {LockRoot}
     */
    static fromSpendCondition(cond) {
        _assertClass(cond, SpendCondition);
        var ptr0 = cond.__destroy_into_raw();
        const ret = wasm.lockroot_fromSpendCondition(ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LockRoot.__wrap(ret[0]);
    }
    /**
     * @returns {Digest}
     */
    get hash() {
        const ret = wasm.lockroot_hash(this.__wbg_ptr);
        return Digest.__wrap(ret);
    }
    /**
     * @returns {SpendCondition | undefined}
     */
    get lock() {
        const ret = wasm.lockroot_lock(this.__wbg_ptr);
        return ret === 0 ? undefined : SpendCondition.__wrap(ret);
    }
    /**
     * @param {Digest} hash
     * @returns {LockRoot}
     */
    static fromHash(hash) {
        _assertClass(hash, Digest);
        var ptr0 = hash.__destroy_into_raw();
        const ret = wasm.lockroot_fromHash(ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LockRoot.__wrap(ret[0]);
    }
}
if (Symbol.dispose) LockRoot.prototype[Symbol.dispose] = LockRoot.prototype.free;

const LockTimFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_locktim_free(ptr >>> 0, 1));

export class LockTim {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(LockTim.prototype);
        obj.__wbg_ptr = ptr;
        LockTimFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        LockTimFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_locktim_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.locktim_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {LockTim}
     */
    static fromProtobuf(value) {
        const ret = wasm.locktim_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return LockTim.__wrap(ret[0]);
    }
    /**
     * @returns {TimelockRange}
     */
    get abs() {
        const ret = wasm.locktim_abs(this.__wbg_ptr);
        return TimelockRange.__wrap(ret);
    }
    /**
     * @param {TimelockRange} rel
     * @param {TimelockRange} abs
     */
    constructor(rel, abs) {
        _assertClass(rel, TimelockRange);
        var ptr0 = rel.__destroy_into_raw();
        _assertClass(abs, TimelockRange);
        var ptr1 = abs.__destroy_into_raw();
        const ret = wasm.locktim_new(ptr0, ptr1);
        this.__wbg_ptr = ret >>> 0;
        LockTimFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {TimelockRange}
     */
    get rel() {
        const ret = wasm.locktim_rel(this.__wbg_ptr);
        return TimelockRange.__wrap(ret);
    }
    /**
     * @returns {LockTim}
     */
    static coinbase() {
        const ret = wasm.locktim_coinbase();
        return LockTim.__wrap(ret);
    }
}
if (Symbol.dispose) LockTim.prototype[Symbol.dispose] = LockTim.prototype.free;

const NameFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_name_free(ptr >>> 0, 1));

export class Name {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Name.prototype);
        obj.__wbg_ptr = ptr;
        NameFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NameFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_name_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.name_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {Name}
     */
    static fromProtobuf(value) {
        const ret = wasm.name_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Name.__wrap(ret[0]);
    }
    /**
     * @param {string} first
     * @param {string} last
     */
    constructor(first, last) {
        const ptr0 = passStringToWasm0(first, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(last, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.name_new(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        NameFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string}
     */
    get last() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.name_last(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    get first() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.name_first(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) Name.prototype[Symbol.dispose] = Name.prototype.free;

const NockchainTxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_nockchaintx_free(ptr >>> 0, 1));

export class NockchainTx {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NockchainTx.prototype);
        obj.__wbg_ptr = ptr;
        NockchainTxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NockchainTxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nockchaintx_free(ptr, 0);
    }
    /**
     * @returns {Digest}
     */
    get id() {
        const ret = wasm.nockchaintx_id(this.__wbg_ptr);
        return Digest.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.nockchaintx_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Convert to jammed transaction file for inspecting through CLI
     * @returns {Uint8Array}
     */
    toJam() {
        const ret = wasm.nockchaintx_toJam(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {Note[]}
     */
    outputs() {
        const ret = wasm.nockchaintx_outputs(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Version}
     */
    get version() {
        const ret = wasm.nockchaintx_version(this.__wbg_ptr);
        return Version.__wrap(ret);
    }
    /**
     * Convert from CLI-compatible jammed transaction file
     * @param {Uint8Array} jam
     * @returns {NockchainTx}
     */
    static fromJam(jam) {
        const ptr0 = passArray8ToWasm0(jam, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.nockchaintx_fromJam(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NockchainTx.__wrap(ret[0]);
    }
    /**
     * @returns {RawTx}
     */
    toRawTx() {
        const ret = wasm.nockchaintx_toRawTx(this.__wbg_ptr);
        return RawTx.__wrap(ret);
    }
}
if (Symbol.dispose) NockchainTx.prototype[Symbol.dispose] = NockchainTx.prototype.free;

const NoteFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_note_free(ptr >>> 0, 1));

export class Note {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Note.prototype);
        obj.__wbg_ptr = ptr;
        NoteFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof Note)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NoteFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_note_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get originPage() {
        const ret = wasm.note_originPage(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.note_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Create a WasmNote from a protobuf Note object (from get_balance response)
     * Expects response.notes[i].note (handles version internally)
     * @param {any} pb_note
     * @returns {Note}
     */
    static fromProtobuf(pb_note) {
        const ret = wasm.note_fromProtobuf(pb_note);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Note.__wrap(ret[0]);
    }
    /**
     * @param {Version} version
     * @param {bigint} origin_page
     * @param {Name} name
     * @param {NoteData} note_data
     * @param {bigint} assets
     */
    constructor(version, origin_page, name, note_data, assets) {
        _assertClass(version, Version);
        var ptr0 = version.__destroy_into_raw();
        _assertClass(name, Name);
        var ptr1 = name.__destroy_into_raw();
        _assertClass(note_data, NoteData);
        var ptr2 = note_data.__destroy_into_raw();
        const ret = wasm.note_new(ptr0, origin_page, ptr1, ptr2, assets);
        this.__wbg_ptr = ret >>> 0;
        NoteFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Digest}
     */
    hash() {
        const ret = wasm.note_hash(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Digest.__wrap(ret[0]);
    }
    /**
     * @returns {Name}
     */
    get name() {
        const ret = wasm.note_name(this.__wbg_ptr);
        return Name.__wrap(ret);
    }
    /**
     * @returns {bigint}
     */
    get assets() {
        const ret = wasm.note_assets(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @returns {Version}
     */
    get version() {
        const ret = wasm.note_version(this.__wbg_ptr);
        return Version.__wrap(ret);
    }
    /**
     * @returns {NoteData}
     */
    get noteData() {
        const ret = wasm.note_noteData(this.__wbg_ptr);
        return NoteData.__wrap(ret);
    }
}
if (Symbol.dispose) Note.prototype[Symbol.dispose] = Note.prototype.free;

const NoteDataFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_notedata_free(ptr >>> 0, 1));

export class NoteData {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NoteData.prototype);
        obj.__wbg_ptr = ptr;
        NoteDataFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NoteDataFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_notedata_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.notedata_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {NoteData}
     */
    static fromProtobuf(value) {
        const ret = wasm.notedata_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NoteData.__wrap(ret[0]);
    }
    /**
     * @param {NoteDataEntry[]} entries
     */
    constructor(entries) {
        const ptr0 = passArrayJsValueToWasm0(entries, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.notedata_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        NoteDataFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {NoteData}
     */
    static empty() {
        const ret = wasm.notedata_empty();
        return NoteData.__wrap(ret);
    }
    /**
     * @returns {NoteDataEntry[]}
     */
    get entries() {
        const ret = wasm.notedata_entries(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {Pkh} pkh
     * @returns {NoteData}
     */
    static fromPkh(pkh) {
        _assertClass(pkh, Pkh);
        var ptr0 = pkh.__destroy_into_raw();
        const ret = wasm.notedata_fromPkh(ptr0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NoteData.__wrap(ret[0]);
    }
}
if (Symbol.dispose) NoteData.prototype[Symbol.dispose] = NoteData.prototype.free;

const NoteDataEntryFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_notedataentry_free(ptr >>> 0, 1));

export class NoteDataEntry {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(NoteDataEntry.prototype);
        obj.__wbg_ptr = ptr;
        NoteDataEntryFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof NoteDataEntry)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NoteDataEntryFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_notedataentry_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.notedataentry_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {NoteDataEntry}
     */
    static fromProtobuf(value) {
        const ret = wasm.notedataentry_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NoteDataEntry.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    get key() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.notedataentry_key(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {string} key
     * @param {Uint8Array} blob
     */
    constructor(key, blob) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(blob, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.notedataentry_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        NoteDataEntryFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Uint8Array}
     */
    get blob() {
        const ret = wasm.notedataentry_blob(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
}
if (Symbol.dispose) NoteDataEntry.prototype[Symbol.dispose] = NoteDataEntry.prototype.free;

const NounFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_noun_free(ptr >>> 0, 1));

export class Noun {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Noun.prototype);
        obj.__wbg_ptr = ptr;
        NounFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        NounFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_noun_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} jam
     * @returns {Noun}
     */
    static cue(jam) {
        const ptr0 = passArray8ToWasm0(jam, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.noun_cue(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Noun.__wrap(ret[0]);
    }
    /**
     * @returns {Uint8Array}
     */
    jam() {
        const ret = wasm.noun_jam(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {any} value
     * @returns {Noun}
     */
    static fromJs(value) {
        const ret = wasm.noun_fromJs(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Noun.__wrap(ret[0]);
    }
    /**
     * @returns {any}
     */
    toJs() {
        const ret = wasm.noun_toJs(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) Noun.prototype[Symbol.dispose] = Noun.prototype.free;

const PkhFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pkh_free(ptr >>> 0, 1));

export class Pkh {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Pkh.prototype);
        obj.__wbg_ptr = ptr;
        PkhFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PkhFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pkh_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.pkh_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {Pkh}
     */
    static fromProtobuf(value) {
        const ret = wasm.pkh_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Pkh.__wrap(ret[0]);
    }
    /**
     * @returns {bigint}
     */
    get m() {
        const ret = wasm.pkh_m(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} m
     * @param {string[]} hashes
     */
    constructor(m, hashes) {
        const ptr0 = passArrayJsValueToWasm0(hashes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pkh_new(m, ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        PkhFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {string[]}
     */
    get hashes() {
        const ret = wasm.pkh_hashes(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {string} hash
     * @returns {Pkh}
     */
    static single(hash) {
        const ptr0 = passStringToWasm0(hash, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.pkh_single(ptr0, len0);
        return Pkh.__wrap(ret);
    }
}
if (Symbol.dispose) Pkh.prototype[Symbol.dispose] = Pkh.prototype.free;

const RawTxFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rawtx_free(ptr >>> 0, 1));

export class RawTx {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RawTx.prototype);
        obj.__wbg_ptr = ptr;
        RawTxFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RawTxFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rawtx_free(ptr, 0);
    }
    /**
     * Convert to protobuf RawTransaction for sending via gRPC
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.rawtx_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {RawTx}
     */
    static fromProtobuf(value) {
        const ret = wasm.rawtx_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return RawTx.__wrap(ret[0]);
    }
    /**
     * @returns {NockchainTx}
     */
    toNockchainTx() {
        const ret = wasm.rawtx_toNockchainTx(this.__wbg_ptr);
        return NockchainTx.__wrap(ret);
    }
    /**
     * @returns {Digest}
     */
    get id() {
        const ret = wasm.rawtx_id(this.__wbg_ptr);
        return Digest.__wrap(ret);
    }
    /**
     * @returns {string}
     */
    get name() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.rawtx_name(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Convert to jammed transaction file for inspecting through CLI
     * @returns {Uint8Array}
     */
    toJam() {
        const ret = wasm.rawtx_toJam(this.__wbg_ptr);
        return ret;
    }
    /**
     * Calculate output notes from the transaction spends.
     * @returns {Note[]}
     */
    outputs() {
        const ret = wasm.rawtx_outputs(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Version}
     */
    get version() {
        const ret = wasm.rawtx_version(this.__wbg_ptr);
        return Version.__wrap(ret);
    }
    /**
     * @param {Uint8Array} jam
     * @returns {RawTx}
     */
    static fromJam(jam) {
        const ptr0 = passArray8ToWasm0(jam, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.rawtx_fromJam(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return RawTx.__wrap(ret[0]);
    }
}
if (Symbol.dispose) RawTx.prototype[Symbol.dispose] = RawTx.prototype.free;

const SeedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_seed_free(ptr >>> 0, 1));

export class Seed {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Seed.prototype);
        obj.__wbg_ptr = ptr;
        SeedFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SeedFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_seed_free(ptr, 0);
    }
    /**
     * @returns {Digest}
     */
    get parentHash() {
        const ret = wasm.seed_parentHash(this.__wbg_ptr);
        return Digest.__wrap(ret);
    }
    /**
     * @returns {Source | undefined}
     */
    get outputSource() {
        const ret = wasm.seed_outputSource(this.__wbg_ptr);
        return ret === 0 ? undefined : Source.__wrap(ret);
    }
    /**
     * @param {LockRoot} lock_root
     */
    set lockRoot(lock_root) {
        _assertClass(lock_root, LockRoot);
        var ptr0 = lock_root.__destroy_into_raw();
        wasm.seed_set_lockRoot(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {NoteData} note_data
     */
    set noteData(note_data) {
        _assertClass(note_data, NoteData);
        var ptr0 = note_data.__destroy_into_raw();
        wasm.seed_set_noteData(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Digest} pkh
     * @param {bigint} gift
     * @param {Digest} parent_hash
     * @param {boolean} include_lock_data
     * @param {any | null} [memo]
     * @returns {Seed}
     */
    static newSinglePkh(pkh, gift, parent_hash, include_lock_data, memo) {
        _assertClass(pkh, Digest);
        var ptr0 = pkh.__destroy_into_raw();
        _assertClass(parent_hash, Digest);
        var ptr1 = parent_hash.__destroy_into_raw();
        const ret = wasm.seed_newSinglePkh(ptr0, gift, ptr1, include_lock_data, isLikeNone(memo) ? 0 : addToExternrefTable0(memo));
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Seed.__wrap(ret[0]);
    }
    /**
     * @param {Digest} parent_hash
     */
    set parentHash(parent_hash) {
        _assertClass(parent_hash, Digest);
        var ptr0 = parent_hash.__destroy_into_raw();
        wasm.seed_set_parentHash(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Source | null} [output_source]
     */
    set outputSource(output_source) {
        let ptr0 = 0;
        if (!isLikeNone(output_source)) {
            _assertClass(output_source, Source);
            ptr0 = output_source.__destroy_into_raw();
        }
        wasm.seed_set_outputSource(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {Source | null | undefined} output_source
     * @param {LockRoot} lock_root
     * @param {bigint} gift
     * @param {NoteData} note_data
     * @param {Digest} parent_hash
     */
    constructor(output_source, lock_root, gift, note_data, parent_hash) {
        let ptr0 = 0;
        if (!isLikeNone(output_source)) {
            _assertClass(output_source, Source);
            ptr0 = output_source.__destroy_into_raw();
        }
        _assertClass(lock_root, LockRoot);
        var ptr1 = lock_root.__destroy_into_raw();
        _assertClass(note_data, NoteData);
        var ptr2 = note_data.__destroy_into_raw();
        _assertClass(parent_hash, Digest);
        var ptr3 = parent_hash.__destroy_into_raw();
        const ret = wasm.seed_new(ptr0, ptr1, gift, ptr2, ptr3);
        this.__wbg_ptr = ret >>> 0;
        SeedFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {bigint}
     */
    get gift() {
        const ret = wasm.seed_gift(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * @param {bigint} gift
     */
    set gift(gift) {
        wasm.seed_set_gift(this.__wbg_ptr, gift);
    }
    /**
     * @returns {LockRoot}
     */
    get lockRoot() {
        const ret = wasm.seed_lockRoot(this.__wbg_ptr);
        return LockRoot.__wrap(ret);
    }
    /**
     * @returns {NoteData}
     */
    get noteData() {
        const ret = wasm.seed_noteData(this.__wbg_ptr);
        return NoteData.__wrap(ret);
    }
}
if (Symbol.dispose) Seed.prototype[Symbol.dispose] = Seed.prototype.free;

const SignatureFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_signature_free(ptr >>> 0, 1));

export class Signature {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Signature.prototype);
        obj.__wbg_ptr = ptr;
        SignatureFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SignatureFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_signature_free(ptr, 0);
    }
    /**
     * @returns {Uint8Array}
     */
    get c() {
        const ret = wasm.signature_c(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @returns {Uint8Array}
     */
    get s() {
        const ret = wasm.signature_s(this.__wbg_ptr);
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * @param {Uint8Array} c
     * @param {Uint8Array} s
     */
    constructor(c, s) {
        const ptr0 = passArray8ToWasm0(c, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(s, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.signature_new(ptr0, len0, ptr1, len1);
        this.__wbg_ptr = ret >>> 0;
        SignatureFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Signature.prototype[Symbol.dispose] = Signature.prototype.free;

const SourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_source_free(ptr >>> 0, 1));

export class Source {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Source.prototype);
        obj.__wbg_ptr = ptr;
        SourceFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SourceFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_source_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    get isCoinbase() {
        const ret = wasm.source_isCoinbase(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {Digest}
     */
    get hash() {
        const ret = wasm.source_hash(this.__wbg_ptr);
        return Digest.__wrap(ret);
    }
}
if (Symbol.dispose) Source.prototype[Symbol.dispose] = Source.prototype.free;

const SpendBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_spendbuilder_free(ptr >>> 0, 1));

export class SpendBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SpendBuilder.prototype);
        obj.__wbg_ptr = ptr;
        SpendBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SpendBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spendbuilder_free(ptr, 0);
    }
    /**
     * Get current refund
     * @returns {Seed | undefined}
     */
    curRefund() {
        const ret = wasm.spendbuilder_curRefund(this.__wbg_ptr);
        return ret === 0 ? undefined : Seed.__wrap(ret);
    }
    /**
     * Checks whether note.assets = seeds + fee
     *
     * This function needs to return true for `TxBuilder::validate` to pass
     * @returns {boolean}
     */
    isBalanced() {
        const ret = wasm.spendbuilder_isBalanced(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Attatch a preimage to this spend
     * @param {Uint8Array} preimage_jam
     * @returns {Digest | undefined}
     */
    addPreimage(preimage_jam) {
        const ptr0 = passArray8ToWasm0(preimage_jam, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.spendbuilder_addPreimage(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : Digest.__wrap(ret[0]);
    }
    /**
     * Compute refund from any spare assets, given `refund_lock` was passed
     * @param {boolean} include_lock_data
     */
    computeRefund(include_lock_data) {
        wasm.spendbuilder_computeRefund(this.__wbg_ptr, include_lock_data);
    }
    /**
     * Manually invalidate signatures
     *
     * Each spend's fee+seeds are bound to one or more signatures. If they get changed, the
     * signature becomes invalid. This builder automatically invalidates signatures upon relevant
     * modifications, but this functionality is provided nonetheless.
     */
    invalidateSigs() {
        wasm.spendbuilder_invalidateSigs(this.__wbg_ptr);
    }
    /**
     * Get the list of missing "unlocks"
     *
     * An unlock is a spend condition to be satisfied. For instance, for a `Pkh` spend condition,
     * if the transaction is unsigned, this function will return a Pkh type missing unlock, with
     * the list of valid PKH's and number of signatures needed. This will not return PKHs that are
     * already attatched to the spend (relevant for multisigs). For `Hax` spend condition, this
     * will return any missing preimages. This function will return a list of not-yet-validated
     * spend conditions.
     * @returns {any[]}
     */
    missingUnlocks() {
        const ret = wasm.spendbuilder_missingUnlocks(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Set the fee of this spend
     * @param {bigint} fee
     */
    fee(fee) {
        wasm.spendbuilder_fee(this.__wbg_ptr, fee);
    }
    /**
     * Create a new `SpendBuilder` with a given note and spend condition
     * @param {Note} note
     * @param {SpendCondition} spend_condition
     * @param {SpendCondition | null} [refund_lock]
     */
    constructor(note, spend_condition, refund_lock) {
        _assertClass(note, Note);
        var ptr0 = note.__destroy_into_raw();
        _assertClass(spend_condition, SpendCondition);
        var ptr1 = spend_condition.__destroy_into_raw();
        let ptr2 = 0;
        if (!isLikeNone(refund_lock)) {
            _assertClass(refund_lock, SpendCondition);
            ptr2 = refund_lock.__destroy_into_raw();
        }
        const ret = wasm.spendbuilder_new(ptr0, ptr1, ptr2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        SpendBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Add seed to this spend
     *
     * Seed is an output with a recipient (as defined by the spend condition).
     *
     * Nockchain transaction engine will take all seeds with matching lock from all spends in the
     * transaction, and merge them into one output note.
     * @param {Seed} seed
     */
    seed(seed) {
        _assertClass(seed, Seed);
        var ptr0 = seed.__destroy_into_raw();
        const ret = wasm.spendbuilder_seed(this.__wbg_ptr, ptr0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sign the transaction with a given private key
     * @param {Uint8Array} signing_key_bytes
     * @returns {boolean}
     */
    sign(signing_key_bytes) {
        const ptr0 = passArray8ToWasm0(signing_key_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.spendbuilder_sign(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
}
if (Symbol.dispose) SpendBuilder.prototype[Symbol.dispose] = SpendBuilder.prototype.free;

const SpendConditionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_spendcondition_free(ptr >>> 0, 1));

export class SpendCondition {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SpendCondition.prototype);
        obj.__wbg_ptr = ptr;
        SpendConditionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof SpendCondition)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SpendConditionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_spendcondition_free(ptr, 0);
    }
    /**
     * @returns {Digest}
     */
    firstName() {
        const ret = wasm.spendcondition_firstName(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Digest.__wrap(ret[0]);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.spendcondition_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {SpendCondition}
     */
    static fromProtobuf(value) {
        const ret = wasm.spendcondition_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return SpendCondition.__wrap(ret[0]);
    }
    /**
     * @param {LockPrimitive[]} primitives
     */
    constructor(primitives) {
        const ptr0 = passArrayJsValueToWasm0(primitives, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.spendcondition_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        SpendConditionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Digest}
     */
    hash() {
        const ret = wasm.spendcondition_hash(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Digest.__wrap(ret[0]);
    }
    /**
     * @param {Pkh} pkh
     * @returns {SpendCondition}
     */
    static newPkh(pkh) {
        _assertClass(pkh, Pkh);
        var ptr0 = pkh.__destroy_into_raw();
        const ret = wasm.spendcondition_newPkh(ptr0);
        return SpendCondition.__wrap(ret);
    }
}
if (Symbol.dispose) SpendCondition.prototype[Symbol.dispose] = SpendCondition.prototype.free;

const TimelockRangeFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_timelockrange_free(ptr >>> 0, 1));

export class TimelockRange {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TimelockRange.prototype);
        obj.__wbg_ptr = ptr;
        TimelockRangeFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TimelockRangeFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_timelockrange_free(ptr, 0);
    }
    /**
     * @returns {bigint | undefined}
     */
    get max() {
        const ret = wasm.timelockrange_max(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1]);
    }
    /**
     * @returns {bigint | undefined}
     */
    get min() {
        const ret = wasm.timelockrange_min(this.__wbg_ptr);
        return ret[0] === 0 ? undefined : BigInt.asUintN(64, ret[1]);
    }
    /**
     * @param {bigint | null} [min]
     * @param {bigint | null} [max]
     */
    constructor(min, max) {
        const ret = wasm.timelockrange_new(!isLikeNone(min), isLikeNone(min) ? BigInt(0) : min, !isLikeNone(max), isLikeNone(max) ? BigInt(0) : max);
        this.__wbg_ptr = ret >>> 0;
        TimelockRangeFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) TimelockRange.prototype[Symbol.dispose] = TimelockRange.prototype.free;

const TxBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_txbuilder_free(ptr >>> 0, 1));

export class TxBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TxBuilder.prototype);
        obj.__wbg_ptr = ptr;
        TxBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TxBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txbuilder_free(ptr, 0);
    }
    /**
     * @returns {SpendBuilder[]}
     */
    allSpends() {
        const ret = wasm.txbuilder_allSpends(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * Appends `preimage_jam` to all spend conditions that expect this preimage.
     * @param {Uint8Array} preimage_jam
     * @returns {Digest | undefined}
     */
    addPreimage(preimage_jam) {
        const ptr0 = passArray8ToWasm0(preimage_jam, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.txbuilder_addPreimage(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : Digest.__wrap(ret[0]);
    }
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
     * @param {Note[]} notes
     * @param {SpendCondition[]} spend_conditions
     * @param {Digest} recipient
     * @param {bigint} gift
     * @param {bigint | null | undefined} fee_override
     * @param {Digest} refund_pkh
     * @param {boolean} include_lock_data
     * @param {any | null} [memo]
     */
    simpleSpend(notes, spend_conditions, recipient, gift, fee_override, refund_pkh, include_lock_data, memo) {
        const ptr0 = passArrayJsValueToWasm0(notes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArrayJsValueToWasm0(spend_conditions, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(recipient, Digest);
        var ptr2 = recipient.__destroy_into_raw();
        _assertClass(refund_pkh, Digest);
        var ptr3 = refund_pkh.__destroy_into_raw();
        const ret = wasm.txbuilder_simpleSpend(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, gift, !isLikeNone(fee_override), isLikeNone(fee_override) ? BigInt(0) : fee_override, ptr3, include_lock_data, isLikeNone(memo) ? 0 : addToExternrefTable0(memo));
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Recalculate fee and set it, balancing things out with refunds
     * @param {boolean} include_lock_data
     */
    recalcAndSetFee(include_lock_data) {
        const ret = wasm.txbuilder_recalcAndSetFee(this.__wbg_ptr, include_lock_data);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Distributes `fee` across builder's spends, and balances refunds out
     *
     * `adjust_fee` parameter allows the fee to be slightly tweaked, whenever notes are added or
     * removed to/from the builder's fee note pool. This is because using more or less notes
     * impacts the exact fee being required. If the caller estimates fee and sets it, adding more
     * notes will change the exact fee needed, and setting this parameter to true will allow one
     * to not have to call this function multiple times.
     * @param {bigint} fee
     * @param {boolean} adjust_fee
     * @param {boolean} include_lock_data
     */
    setFeeAndBalanceRefund(fee, adjust_fee, include_lock_data) {
        const ret = wasm.txbuilder_setFeeAndBalanceRefund(this.__wbg_ptr, fee, adjust_fee, include_lock_data);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Create an empty transaction builder
     * @param {bigint} fee_per_word
     */
    constructor(fee_per_word) {
        const ret = wasm.txbuilder_new(fee_per_word);
        this.__wbg_ptr = ret >>> 0;
        TxBuilderFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Sign the transaction with a private key.
     *
     * This will sign all spends that are still missing signature from
     * @param {Uint8Array} signing_key_bytes
     */
    sign(signing_key_bytes) {
        const ptr0 = passArray8ToWasm0(signing_key_bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.txbuilder_sign(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {NockchainTx}
     */
    build() {
        const ret = wasm.txbuilder_build(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return NockchainTx.__wrap(ret[0]);
    }
    /**
     * Append a `SpendBuilder` to this transaction
     * @param {SpendBuilder} spend
     * @returns {SpendBuilder | undefined}
     */
    spend(spend) {
        _assertClass(spend, SpendBuilder);
        var ptr0 = spend.__destroy_into_raw();
        const ret = wasm.txbuilder_spend(this.__wbg_ptr, ptr0);
        return ret === 0 ? undefined : SpendBuilder.__wrap(ret);
    }
    /**
     * Gets the current fee set on all spends.
     * @returns {bigint}
     */
    curFee() {
        const ret = wasm.txbuilder_curFee(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Reconstruct a builder from raw transaction and its input notes.
     *
     * To get the builder back, you must pass the notes and their corresponding spend conditions.
     * If serializing the builder, call `WasmTxBuilder::all_notes`.
     * @param {RawTx} tx
     * @param {Note[]} notes
     * @param {SpendCondition[]} spend_conditions
     * @returns {TxBuilder}
     */
    static fromTx(tx, notes, spend_conditions) {
        _assertClass(tx, RawTx);
        var ptr0 = tx.__destroy_into_raw();
        const ptr1 = passArrayJsValueToWasm0(notes, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArrayJsValueToWasm0(spend_conditions, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.txbuilder_fromTx(ptr0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return TxBuilder.__wrap(ret[0]);
    }
    /**
     * Calculates the fee needed for the transaction.
     *
     * NOTE: if the transaction is unsigned, this function will estimate the fee needed, supposing
     * all signatures are added. However, this heuristic is only accurate for one signature. In
     * addition, this fee calculation does not estimate the size of missing preimages.
     *
     * So, first, add missing preimages, and only then calc the fee. If you're building a multisig
     * transaction, this value might be incorrect.
     * @returns {bigint}
     */
    calcFee() {
        const ret = wasm.txbuilder_calcFee(this.__wbg_ptr);
        return BigInt.asUintN(64, ret);
    }
    /**
     * Validate the transaction.
     */
    validate() {
        const ret = wasm.txbuilder_validate(this.__wbg_ptr);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @returns {TxNotes}
     */
    allNotes() {
        const ret = wasm.txbuilder_allNotes(this.__wbg_ptr);
        return TxNotes.__wrap(ret);
    }
}
if (Symbol.dispose) TxBuilder.prototype[Symbol.dispose] = TxBuilder.prototype.free;

const TxNotesFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_txnotes_free(ptr >>> 0, 1));

export class TxNotes {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(TxNotes.prototype);
        obj.__wbg_ptr = ptr;
        TxNotesFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        TxNotesFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_txnotes_free(ptr, 0);
    }
    /**
     * @returns {SpendCondition[]}
     */
    get spendConditions() {
        const ret = wasm.txnotes_spendConditions(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Note[]}
     */
    get notes() {
        const ret = wasm.txnotes_notes(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
}
if (Symbol.dispose) TxNotes.prototype[Symbol.dispose] = TxNotes.prototype.free;

const VersionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_version_free(ptr >>> 0, 1));

export class Version {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Version.prototype);
        obj.__wbg_ptr = ptr;
        VersionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VersionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_version_free(ptr, 0);
    }
    /**
     * @returns {Version}
     */
    static V0() {
        const ret = wasm.version_V0();
        return Version.__wrap(ret);
    }
    /**
     * @returns {Version}
     */
    static V1() {
        const ret = wasm.version_V1();
        return Version.__wrap(ret);
    }
    /**
     * @returns {Version}
     */
    static V2() {
        const ret = wasm.version_V2();
        return Version.__wrap(ret);
    }
    /**
     * @param {number} version
     */
    constructor(version) {
        const ret = wasm.version_new(version);
        this.__wbg_ptr = ret >>> 0;
        VersionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) Version.prototype[Symbol.dispose] = Version.prototype.free;

const WasmSeedFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_wasmseed_free(ptr >>> 0, 1));

export class WasmSeed {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WasmSeedFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmseed_free(ptr, 0);
    }
    /**
     * @returns {any}
     */
    toProtobuf() {
        const ret = wasm.wasmseed_toProtobuf(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {any} value
     * @returns {Seed}
     */
    static fromProtobuf(value) {
        const ret = wasm.wasmseed_fromProtobuf(value);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Seed.__wrap(ret[0]);
    }
}
if (Symbol.dispose) WasmSeed.prototype[Symbol.dispose] = WasmSeed.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_Error_e83987f665cf5504 = function(arg0, arg1) {
        const ret = Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_Number_bb48ca12f395cd08 = function(arg0) {
        const ret = Number(arg0);
        return ret;
    };
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_bigint_get_as_i64_f3ebc5a755000afd = function(arg0, arg1) {
        const v = arg1;
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_boolean_get_6d5a1ee65bab5f68 = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? v : undefined;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg___wbindgen_debug_string_df47ffb5e35e6763 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_in_bb933bd9e1b3bc0f = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_bigint_cb320707dcd35f0b = function(arg0) {
        const ret = typeof(arg0) === 'bigint';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_function_ee8a6c5833c90377 = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_null_5e69f72e906cc57c = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_c818261d21f283a4 = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_fbb76cb2940daafd = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_2d472862bd29a478 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_jsval_eq_6b13ab83478b1c50 = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_jsval_loose_eq_b664b38a2f582147 = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_number_get_a20bf9b85341449d = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_string_get_e4f06c90489ad01b = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_b855445ff6a94295 = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_2454a539ea5790d9 = function(arg0) {
        arg0._wbg_cb_unref();
    };
    imports.wbg.__wbg_append_b577eb3a177bc0fa = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_body_587542b2fd8e06c0 = function(arg0) {
        const ret = arg0.body;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_buffer_ccc4520b36d3ccf4 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_byobRequest_2344e6975f27456e = function(arg0) {
        const ret = arg0.byobRequest;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_byteLength_bcd42e4025299788 = function(arg0) {
        const ret = arg0.byteLength;
        return ret;
    };
    imports.wbg.__wbg_byteOffset_ca3a6cf7944b364b = function(arg0) {
        const ret = arg0.byteOffset;
        return ret;
    };
    imports.wbg.__wbg_call_525440f72fbfc0ea = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_e762c39fa8ea36bf = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cancel_48ab6f9dc366e369 = function(arg0) {
        const ret = arg0.cancel();
        return ret;
    };
    imports.wbg.__wbg_catch_943836faa5d29bfb = function(arg0, arg1) {
        const ret = arg0.catch(arg1);
        return ret;
    };
    imports.wbg.__wbg_close_5a6caed3231b68cd = function() { return handleError(function (arg0) {
        arg0.close();
    }, arguments) };
    imports.wbg.__wbg_close_6956df845478561a = function() { return handleError(function (arg0) {
        arg0.close();
    }, arguments) };
    imports.wbg.__wbg_digest_new = function(arg0) {
        const ret = Digest.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_digest_unwrap = function(arg0) {
        const ret = Digest.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_done_2042aa2670fb1db1 = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_enqueue_7b18a650aec77898 = function() { return handleError(function (arg0, arg1) {
        arg0.enqueue(arg1);
    }, arguments) };
    imports.wbg.__wbg_entries_e171b586f8f6bdbf = function(arg0) {
        const ret = Object.entries(arg0);
        return ret;
    };
    imports.wbg.__wbg_fetch_769f3df592e37b75 = function(arg0, arg1) {
        const ret = fetch(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_fetch_8725865ff47e7fcc = function(arg0, arg1, arg2) {
        const ret = arg0.fetch(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_getReader_48e00749fe3f6089 = function() { return handleError(function (arg0) {
        const ret = arg0.getReader();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_7bed016f185add81 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_get_done_a0463af43a1fc764 = function(arg0) {
        const ret = arg0.done;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg_get_efcb449f58ec27c2 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_value_5ce96c9f81ce7398 = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_get_with_ref_key_1dc361bd10053bfe = function(arg0, arg1) {
        const ret = arg0[arg1];
        return ret;
    };
    imports.wbg.__wbg_has_787fafc980c3ccdb = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_headers_b87d7eaba61c3278 = function(arg0) {
        const ret = arg0.headers;
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_70beb1189ca63b38 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Map_8579b5e2ab5437c7 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Map;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_20c8e73002f7af98 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_96e0af9891d0945d = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_d216eda7911dde36 = function(arg0) {
        const ret = Number.isSafeInteger(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_e5822695327a3c39 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_69bca3cb64fc8748 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_cdd215e10d9dd507 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_lockprimitive_unwrap = function(arg0) {
        const ret = LockPrimitive.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_1acc0b6eea89d040 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_3c3d849046688a66 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue__wasm_bindgen_9165caa7615cc679___JsValue_____(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return ret;
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_5a79be3ab53b8aa5 = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_9edf9838a2def39c = function() { return handleError(function () {
        const ret = new Headers();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_a7442b4b19c1a356 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_e17d9f43105b08be = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_from_slice_92f4d78ca282a2d2 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_no_args_ee98eee5275000a4 = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_with_byte_offset_and_length_46e3e6a5e9f9e89b = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_str_and_init_0ae7728b6ec367b1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_next_020810e0ae8ebcb0 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_next_2c826fe5dfec6b6a = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_note_new = function(arg0) {
        const ret = Note.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_note_unwrap = function(arg0) {
        const ret = Note.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_notedataentry_new = function(arg0) {
        const ret = NoteDataEntry.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_notedataentry_unwrap = function(arg0) {
        const ret = NoteDataEntry.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_prototypesetcall_2a6620b6922694b2 = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    };
    imports.wbg.__wbg_queueMicrotask_34d692c25c47d05b = function(arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_9d76cacb20c84d58 = function(arg0) {
        queueMicrotask(arg0);
    };
    imports.wbg.__wbg_read_48f1593df542f968 = function(arg0) {
        const ret = arg0.read();
        return ret;
    };
    imports.wbg.__wbg_releaseLock_5d0b5a68887b891d = function(arg0) {
        arg0.releaseLock();
    };
    imports.wbg.__wbg_resolve_caf97c30b83f7053 = function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_respond_0f4dbf5386f5c73e = function() { return handleError(function (arg0, arg1) {
        arg0.respond(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_set_9e6516df7b7d0f19 = function(arg0, arg1, arg2) {
        arg0.set(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_set_body_3c365989753d61f4 = function(arg0, arg1) {
        arg0.body = arg1;
    };
    imports.wbg.__wbg_set_c213c871859d6500 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_cache_2f9deb19b92b81e3 = function(arg0, arg1) {
        arg0.cache = __wbindgen_enum_RequestCache[arg1];
    };
    imports.wbg.__wbg_set_credentials_f621cd2d85c0c228 = function(arg0, arg1) {
        arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_set_headers_6926da238cd32ee4 = function(arg0, arg1) {
        arg0.headers = arg1;
    };
    imports.wbg.__wbg_set_integrity_62a46fc792832f41 = function(arg0, arg1, arg2) {
        arg0.integrity = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_method_c02d8cbbe204ac2d = function(arg0, arg1, arg2) {
        arg0.method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_mode_52ef73cfa79639cb = function(arg0, arg1) {
        arg0.mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_set_redirect_df0285496ec45ff8 = function(arg0, arg1) {
        arg0.redirect = __wbindgen_enum_RequestRedirect[arg1];
    };
    imports.wbg.__wbg_set_referrer_ec9cf8a8a315d50c = function(arg0, arg1, arg2) {
        arg0.referrer = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_referrer_policy_99c1f299b4e37446 = function(arg0, arg1) {
        arg0.referrerPolicy = __wbindgen_enum_ReferrerPolicy[arg1];
    };
    imports.wbg.__wbg_spendbuilder_new = function(arg0) {
        const ret = SpendBuilder.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_spendcondition_new = function(arg0) {
        const ret = SpendCondition.__wrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_spendcondition_unwrap = function(arg0) {
        const ret = SpendCondition.__unwrap(arg0);
        return ret;
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_89e1d9ac6a1b250e = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_8b530f326a9e48ac = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_6fdf4b64710cc91b = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_b45bfc5a37f6cfa2 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_status_de7eed5a7a5bfd5d = function(arg0) {
        const ret = arg0.status;
        return ret;
    };
    imports.wbg.__wbg_then_4f46f6544e6b4a28 = function(arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbg_then_70d05cf780a18d77 = function(arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_toString_7da7c8dbec78fcb8 = function(arg0) {
        const ret = arg0.toString();
        return ret;
    };
    imports.wbg.__wbg_value_692627309814bb8c = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_view_f6c15ac9fed63bbd = function(arg0) {
        const ret = arg0.view;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_4625c577ab2ec9ee = function(arg0) {
        // Cast intrinsic for `U64 -> Externref`.
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_cast_7cc765810adca37d = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 261, function: Function { arguments: [Externref], shim_idx: 262, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen_9165caa7615cc679___closure__destroy___dyn_core_bb1c441fd6008630___ops__function__FnMut__wasm_bindgen_9165caa7615cc679___JsValue____Output_______, wasm_bindgen_9165caa7615cc679___convert__closures_____invoke___wasm_bindgen_9165caa7615cc679___JsValue_____);
        return ret;
    };
    imports.wbg.__wbindgen_cast_9ae0607507abb057 = function(arg0) {
        // Cast intrinsic for `I64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_object_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('iris_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
