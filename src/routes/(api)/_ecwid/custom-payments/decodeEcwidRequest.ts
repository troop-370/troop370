// Code from this module is adapted from https://gist.github.com/manuelfdo/94a14c0314b07e311f07b240921eab86
import { ECWID_CLIENT_SECRET } from '$env/static/private';

export async function decodeEcwidRequest(payload: string) {
  // add required padding to make the payload a multiple of 4
  while (payload.length % 4 !== 0) {
    payload += '=';
  }

  const originalBase64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decodedBase64 = atob(originalBase64);

  const iv = str2ab(decodedBase64.substring(0, 16));
  const cipherOrder = b642ab(originalBase64);
  const keyData = str2ab(ECWID_CLIENT_SECRET.substring(0, 16));

  const decryptedBuffer = await decryptOrder(iv, cipherOrder, keyData);
  const decryptedStr = new TextDecoder().decode(decryptedBuffer);

  const firstIndexOfOpenBrace = decryptedStr.indexOf('{"storeId');
  try {
    return JSON.parse(decryptedStr.substring(firstIndexOfOpenBrace));
  } catch (error) {
    console.error({ error, decryptedStr, firstIndexOfOpenBrace });
    return null;
  }
}

async function decryptOrder(iv: ArrayBuffer, cipherOrder: ArrayBufferLike, keyData: ArrayBuffer) {
  var key = await importKey(keyData);
  try {
    return await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, key, cipherOrder);
  } catch (error) {
    if (error instanceof Error) {
      console.error('An error occurred: Name: ', error.name, ', Message: ', error.message);
    } else {
      console.error(error);
    }
  }
}

async function importKey(keyData: ArrayBuffer) {
  var key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-CBC' }, true, ['decrypt']);
  return key;
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

// Concept from https://stackoverflow.com/a/21797381/9014097 Convert Base64 to Array Buffer.
function b642ab(base64: string) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
