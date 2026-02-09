/**
 * Real E2E Encrypted Messaging Test
 * Uses Node.js crypto.subtle (same as browser Web Crypto API)
 * to generate real ECDH keys, encrypt, and verify decryption.
 */
import { webcrypto } from 'node:crypto'
const crypto = webcrypto

const BASE = 'http://localhost:8080/api/v1'

// --- Crypto helpers (same logic as frontend e2e-crypto.ts) ---

async function generateKeyPair() {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
}

async function importPublicKey(jwk) {
  return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
}

async function computeFingerprint(publicKey) {
  const raw = await crypto.subtle.exportKey('raw', publicKey)
  const hash = await crypto.subtle.digest('SHA-256', raw)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function deriveAESKey(myPrivateKey, peerPublicKey) {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    myPrivateKey,
    256
  )
  const hkdfKey = await crypto.subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey'])
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

function arrayBufferToBase64(buf) {
  return Buffer.from(buf).toString('base64')
}

function base64ToArrayBuffer(b64) {
  const buf = Buffer.from(b64, 'base64')
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

async function encryptMessage(plaintext, myPrivateKey, recipientPubKeyJWK) {
  const recipientKey = await importPublicKey(recipientPubKeyJWK)
  const aesKey = await deriveAESKey(myPrivateKey, recipientKey)
  const nonce = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, encoded)
  return {
    encryptedContent: arrayBufferToBase64(ciphertext),
    nonce: arrayBufferToBase64(nonce),
  }
}

async function decryptMessage(encryptedContent, nonce, myPrivateKey, senderPubKeyJWK) {
  const senderKey = await importPublicKey(senderPubKeyJWK)
  const aesKey = await deriveAESKey(myPrivateKey, senderKey)
  const ct = base64ToArrayBuffer(encryptedContent)
  const iv = base64ToArrayBuffer(nonce)
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct)
  return new TextDecoder().decode(plain)
}

// --- API helper ---

async function api(method, path, token, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (token) opts.headers['Authorization'] = `Bearer ${token}`
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  const text = await res.text()
  try { return { status: res.status, data: JSON.parse(text) } }
  catch { return { status: res.status, data: text } }
}

const decodeJWT = (t) => JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString())

// --- Main test ---

async function main() {
  console.log('=== REAL E2E ENCRYPTED MESSAGING TEST ===\n')

  // 1. Login
  console.log('1. LOGIN')
  const devLogin = await api('POST', '/masterdata/users/login', null, { email: 'dev@malaka.co.id', password: '687654' })
  const purchLogin = await api('POST', '/masterdata/users/login', null, { email: 'purchasing@malaka.co.id', password: 'password123' })
  const DEV_TOKEN = devLogin.data.token
  const PURCH_TOKEN = purchLogin.data.token
  const devId = decodeJWT(DEV_TOKEN).sub
  const purchId = decodeJWT(PURCH_TOKEN).sub
  console.log(`   dev@malaka.co.id       -> ${devId}`)
  console.log(`   purchasing@malaka.co.id -> ${purchId}\n`)

  // 2. Generate REAL ECDH key pairs
  console.log('2. GENERATE ECDH P-256 KEY PAIRS')
  const devKeyPair = await generateKeyPair()
  const purchKeyPair = await generateKeyPair()
  const devPubJWK = await crypto.subtle.exportKey('jwk', devKeyPair.publicKey)
  const purchPubJWK = await crypto.subtle.exportKey('jwk', purchKeyPair.publicKey)
  const devFingerprint = await computeFingerprint(devKeyPair.publicKey)
  const purchFingerprint = await computeFingerprint(purchKeyPair.publicKey)
  console.log(`   DEV fingerprint:   ${devFingerprint.substring(0, 32)}...`)
  console.log(`   PURCH fingerprint: ${purchFingerprint.substring(0, 32)}...\n`)

  // 3. Upload public keys to server
  console.log('3. UPLOAD PUBLIC KEYS TO SERVER')
  const devKeyRes = await api('PUT', '/messaging/keys', DEV_TOKEN, {
    public_key_jwk: devPubJWK,
    key_fingerprint: devFingerprint,
    device_label: 'test-node',
  })
  const purchKeyRes = await api('PUT', '/messaging/keys', PURCH_TOKEN, {
    public_key_jwk: purchPubJWK,
    key_fingerprint: purchFingerprint,
    device_label: 'test-node',
  })
  console.log(`   DEV key ID:   ${devKeyRes.data.id} (${devKeyRes.status})`)
  console.log(`   PURCH key ID: ${purchKeyRes.data.id} (${purchKeyRes.status})\n`)

  // 4. Fetch each other's keys from server
  console.log('4. CROSS-FETCH PUBLIC KEYS')
  const devGetsPurchKey = await api('GET', `/messaging/keys/${purchId}`, DEV_TOKEN)
  const purchGetsDevKey = await api('GET', `/messaging/keys/${devId}`, PURCH_TOKEN)
  const serverPurchPubJWK = devGetsPurchKey.data.public_key_jwk
  const serverDevPubJWK = purchGetsDevKey.data.public_key_jwk
  console.log(`   DEV got PURCH key: ${devGetsPurchKey.status === 200 ? 'OK' : 'FAIL'}`)
  console.log(`   PURCH got DEV key: ${purchGetsDevKey.status === 200 ? 'OK' : 'FAIL'}\n`)

  // 5. Create conversation
  console.log('5. CREATE CONVERSATION')
  const conv = await api('POST', '/messaging/conversations', DEV_TOKEN, { recipient_id: purchId })
  const CONV_ID = conv.data.id
  console.log(`   Conversation: ${CONV_ID}\n`)

  // 6. DEV sends encrypted message to PURCH
  console.log('6. SEND ENCRYPTED MESSAGES')
  const msg1Plain = 'Hello from dev! Can you check PO-2024-001?'
  const msg1Enc = await encryptMessage(msg1Plain, devKeyPair.privateKey, serverPurchPubJWK)
  const msg1Res = await api('POST', `/messaging/conversations/${CONV_ID}/messages`, DEV_TOKEN, {
    encrypted_content: msg1Enc.encryptedContent,
    nonce: msg1Enc.nonce,
    sender_public_key_id: devKeyRes.data.id,
  })
  console.log(`   DEV -> "${msg1Plain}" => ${msg1Res.status}`)

  // PURCH sends reply
  const msg2Plain = 'Sure! I will review it now and get back to you.'
  const msg2Enc = await encryptMessage(msg2Plain, purchKeyPair.privateKey, serverDevPubJWK)
  const msg2Res = await api('POST', `/messaging/conversations/${CONV_ID}/messages`, PURCH_TOKEN, {
    encrypted_content: msg2Enc.encryptedContent,
    nonce: msg2Enc.nonce,
    sender_public_key_id: purchKeyRes.data.id,
  })
  console.log(`   PURCH -> "${msg2Plain}" => ${msg2Res.status}`)

  // DEV sends another message
  const msg3Plain = 'Thanks! Let me know if you need the budget approval doc.'
  const msg3Enc = await encryptMessage(msg3Plain, devKeyPair.privateKey, serverPurchPubJWK)
  const msg3Res = await api('POST', `/messaging/conversations/${CONV_ID}/messages`, DEV_TOKEN, {
    encrypted_content: msg3Enc.encryptedContent,
    nonce: msg3Enc.nonce,
    sender_public_key_id: devKeyRes.data.id,
  })
  console.log(`   DEV -> "${msg3Plain}" => ${msg3Res.status}\n`)

  // 7. Retrieve messages and decrypt
  console.log('7. RETRIEVE AND DECRYPT MESSAGES')
  const allMsgs = await api('GET', `/messaging/conversations/${CONV_ID}/messages`, DEV_TOKEN)
  console.log(`   ${allMsgs.data.length} messages in conversation:\n`)

  for (const m of allMsgs.data) {
    const isSentByDev = m.sender_id === devId
    const sender = isSentByDev ? 'DEV' : 'PURCH'

    // DEV decrypting: use own private key + other user's public key
    // For messages DEV sent: ECDH(dev_private, purch_public) -> same shared secret as encryption
    // For messages PURCH sent: ECDH(dev_private, purch_public) -> same shared secret as PURCH used
    try {
      const decryptedByDev = await decryptMessage(
        m.encrypted_content,
        m.nonce,
        devKeyPair.privateKey,
        serverPurchPubJWK  // Always use the OTHER user's public key
      )
      console.log(`   [${sender}] DEV decrypts:   "${decryptedByDev}"`)
    } catch (e) {
      console.log(`   [${sender}] DEV decrypt FAILED: ${e.message}`)
    }

    // PURCH decrypting: use own private key + other user's public key
    try {
      const decryptedByPurch = await decryptMessage(
        m.encrypted_content,
        m.nonce,
        purchKeyPair.privateKey,
        serverDevPubJWK  // Always use the OTHER user's public key
      )
      console.log(`   [${sender}] PURCH decrypts: "${decryptedByPurch}"`)
    } catch (e) {
      console.log(`   [${sender}] PURCH decrypt FAILED: ${e.message}`)
    }
    console.log()
  }

  // 8. Verify server cannot read the data
  console.log('8. VERIFY SERVER STORES ONLY CIPHERTEXT')
  for (const m of allMsgs.data) {
    const rawContent = m.encrypted_content
    console.log(`   Content: ${rawContent.substring(0, 50)}...`)
    console.log(`   Nonce:   ${m.nonce}`)
    // Try decoding as text — should be gibberish, not plaintext
    const decoded = Buffer.from(rawContent, 'base64')
    const hasPlaintext = decoded.toString().includes('Hello') || decoded.toString().includes('Sure') || decoded.toString().includes('Thanks')
    console.log(`   Contains plaintext: ${hasPlaintext ? 'YES (FAIL!)' : 'NO (PASS - encrypted)'}`)
    console.log()
  }

  // 9. Unread counts
  console.log('9. UNREAD COUNTS')
  const devUC = await api('GET', '/messaging/unread-count', DEV_TOKEN)
  const purchUC = await api('GET', '/messaging/unread-count', PURCH_TOKEN)
  console.log(`   DEV:   ${devUC.data.count} unread`)
  console.log(`   PURCH: ${purchUC.data.count} unread\n`)

  // 10. Conversations
  console.log('10. CONVERSATIONS LIST')
  const devConvs = await api('GET', '/messaging/conversations', DEV_TOKEN)
  const purchConvs = await api('GET', '/messaging/conversations', PURCH_TOKEN)
  devConvs.data.forEach(c => console.log(`   DEV:   chat with ${c.other_user?.email} (${c.unread_count} unread)`))
  purchConvs.data.forEach(c => console.log(`   PURCH: chat with ${c.other_user?.email} (${c.unread_count} unread)`))

  console.log('\n=== ALL TESTS COMPLETE ===')
}

main().catch(console.error)
