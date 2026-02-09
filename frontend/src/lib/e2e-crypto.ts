/**
 * End-to-End Encryption Utilities
 * ECDH P-256 key agreement + AES-GCM 256-bit encryption
 * Private keys stored in IndexedDB, public keys uploaded to server as JWK.
 */

const DB_NAME = 'malaka_e2e_keys'
const STORE_NAME = 'keypairs'
const DB_VERSION = 1

// --- IndexedDB helpers ---

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'userId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// --- Key Pair Management ---

export interface StoredKeyPair {
  userId: string
  publicKeyJWK: JsonWebKey
  privateKeyJWK: JsonWebKey
  fingerprint: string
  createdAt: string
}

/**
 * Generate a new ECDH P-256 key pair.
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true, // extractable
    ['deriveBits']
  )
}

/**
 * Store a key pair in IndexedDB for the given user.
 */
export async function storeKeyPair(userId: string, keyPair: CryptoKeyPair): Promise<StoredKeyPair> {
  const publicKeyJWK = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
  const privateKeyJWK = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
  const fingerprint = await computeFingerprint(keyPair.publicKey)

  const record: StoredKeyPair = {
    userId,
    publicKeyJWK,
    privateKeyJWK,
    fingerprint,
    createdAt: new Date().toISOString(),
  }

  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(record)
    tx.oncomplete = () => resolve(record)
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Retrieve the stored key pair for a user from IndexedDB.
 */
export async function getStoredKeyPair(userId: string): Promise<StoredKeyPair | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(userId)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Import a private key JWK back into a CryptoKey.
 */
export async function importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveBits']
  )
}

/**
 * Import a public key JWK into a CryptoKey.
 */
export async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
}

/**
 * Compute a SHA-256 fingerprint of a public key (hex string).
 */
export async function computeFingerprint(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', publicKey)
  const hash = await crypto.subtle.digest('SHA-256', raw)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// --- Encryption / Decryption ---

/**
 * Derive an AES-GCM-256 key from ECDH shared secret using HKDF.
 */
async function deriveAESKey(myPrivateKey: CryptoKey, peerPublicKey: CryptoKey): Promise<CryptoKey> {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    myPrivateKey,
    256
  )

  // Import shared bits as HKDF key material
  const hkdfKey = await crypto.subtle.importKey(
    'raw',
    sharedBits,
    'HKDF',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new TextEncoder().encode('malaka-e2e-chat'),
      info: new TextEncoder().encode('aes-gcm-256'),
    },
    hkdfKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export interface EncryptedPayload {
  encryptedContent: string // base64
  nonce: string // base64
}

/**
 * Encrypt a plaintext message using ECDH + AES-GCM.
 */
export async function encryptMessage(
  plaintext: string,
  myPrivateKey: CryptoKey,
  recipientPubKeyJWK: JsonWebKey
): Promise<EncryptedPayload> {
  const recipientKey = await importPublicKey(recipientPubKeyJWK)
  const aesKey = await deriveAESKey(myPrivateKey, recipientKey)

  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    aesKey,
    encoded
  )

  return {
    encryptedContent: arrayBufferToBase64(ciphertext),
    nonce: arrayBufferToBase64(nonce.buffer as ArrayBuffer),
  }
}

/**
 * Decrypt an encrypted message using ECDH + AES-GCM.
 */
export async function decryptMessage(
  encryptedContent: string,
  nonce: string,
  myPrivateKey: CryptoKey,
  senderPubKeyJWK: JsonWebKey
): Promise<string> {
  const senderKey = await importPublicKey(senderPubKeyJWK)
  const aesKey = await deriveAESKey(myPrivateKey, senderKey)

  const ciphertext = base64ToArrayBuffer(encryptedContent)
  const iv = base64ToArrayBuffer(nonce)

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ciphertext
  )

  return new TextDecoder().decode(plainBuffer)
}

// --- Base64 utilities ---

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
