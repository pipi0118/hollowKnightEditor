declare module 'aes-js' {
  export namespace utils {
    export namespace utf8 {
      export function toBytes(text: string): Uint8Array;
      export function fromBytes(bytes: number[] | Uint8Array): string;
    }
  }

  export namespace ModeOfOperation {
    export class ecb {
      constructor(key: number[] | Uint8Array);
      encrypt(plaintext: number[] | Uint8Array): Uint8Array;
      decrypt(ciphertext: number[] | Uint8Array): Uint8Array;
    }
  }
}