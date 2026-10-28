// Code from this module is adapted from https://gist.github.com/manuelfdo/94a14c0314b07e311f07b240921eab86
import { ECWID_CLIENT_SECRET } from '$env/static/private';

type EncryptionMode = 'AES-CBC' | 'AES-GCM';

export async function decodeEcwidRequest(payload: string, encryptionMode: EncryptionMode) {
  // add required padding to make the payload a multiple of 4
  while (payload.length % 4 !== 0) {
    payload += '=';
  }

  const originalBase64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decoded = Uint8Array.from(atob(originalBase64), (character) => character.charCodeAt(0));
  const keyData = str2ab(ECWID_CLIENT_SECRET.substring(0, 16));

  let decryptedBuffer: ArrayBuffer;
  if (encryptionMode === 'AES-GCM') {
    if (decoded.length < 32) {
      throw new Error('Invalid Ecwid AES-GCM payload');
    }

    const iv = decoded.subarray(0, 16);
    const ciphertext = decoded.subarray(16, -16);
    const tag = decoded.subarray(-16);
    const ciphertextWithTag = new Uint8Array(ciphertext.length + tag.length);
    ciphertextWithTag.set(ciphertext);
    ciphertextWithTag.set(tag, ciphertext.length);

    const key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, [
      'decrypt',
    ]);
    decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      ciphertextWithTag
    );
  } else {
    const iv = decoded.subarray(0, 16);
    decryptedBuffer = await decryptOrder(iv, decoded.subarray(16), keyData);
  }

  const decryptedStr = new TextDecoder().decode(decryptedBuffer);

  const json =
    encryptionMode === 'AES-CBC'
      ? decryptedStr.substring(decryptedStr.indexOf('{"storeId'))
      : decryptedStr;
  return JSON.parse(json);
}

async function decryptOrder(iv: Uint8Array, cipherOrder: Uint8Array, keyData: ArrayBuffer) {
  const key = await importKey(keyData);
  return crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, cipherOrder);
}

async function importKey(keyData: ArrayBuffer) {
  return crypto.subtle.importKey('raw', keyData, { name: 'AES-CBC' }, false, ['decrypt']);
}

// Concept from https://stackoverflow.com/a/11058858. Convert String to Array Buffer
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
