import {
  encryptText,
  decryptText,
  encryptObject,
  decryptObject,
  encryptPhoneNumber,
  decryptPhoneNumber,
  encryptEmail,
  decryptEmail,
  encryptAddress,
  decryptAddress,
  encryptPaymentData,
  createHash,
  verifyHash,
  encryptForFirestore,
  decryptFromFirestore,
} from '../../services/EncryptionService';

describe('EncryptionService', () => {
  describe('encryptText / decryptText', () => {
    it('should encrypt and decrypt a plain string', () => {
      const original = 'Hello, T-REX Shop!';
      const encrypted = encryptText(original);

      expect(encrypted).not.toBe(original);
      expect(typeof encrypted).toBe('string');

      const decrypted = decryptText(encrypted);
      expect(decrypted).toBe(original);
    });

    it('should produce different ciphertext on each call (random IV)', () => {
      const text = 'same input';
      const a = encryptText(text);
      const b = encryptText(text);
      // CryptoJS AES uses a random salt, so ciphertexts differ
      expect(a).not.toBe(b);
    });

    it('should handle empty string', () => {
      const encrypted = encryptText('');
      const decrypted = decryptText(encrypted);
      expect(decrypted).toBe('');
    });

    it('should handle unicode / Arabic text', () => {
      const arabic = 'مرحبا بك في تي ركس شوب';
      const encrypted = encryptText(arabic);
      const decrypted = decryptText(encrypted);
      expect(decrypted).toBe(arabic);
    });

    it('should handle long strings', () => {
      const long = 'a'.repeat(10_000);
      const encrypted = encryptText(long);
      const decrypted = decryptText(encrypted);
      expect(decrypted).toBe(long);
    });
  });

  describe('encryptObject / decryptObject', () => {
    it('should round-trip a simple object', () => {
      const obj = { name: 'Test', price: 99.99, inStock: true };
      const encrypted = encryptObject(obj);

      expect(typeof encrypted).toBe('string');

      const decrypted = decryptObject(encrypted);
      expect(decrypted).toEqual(obj);
    });

    it('should handle nested objects', () => {
      const nested = {
        user: { name: 'Ali', address: { city: 'Sanaa', country: 'Yemen' } },
        items: [1, 2, 3],
      };
      const encrypted = encryptObject(nested);
      const decrypted = decryptObject(encrypted);
      expect(decrypted).toEqual(nested);
    });

    it('should handle arrays', () => {
      const arr = [1, 'two', { three: 3 }];
      const encrypted = encryptObject(arr);
      const decrypted = decryptObject(encrypted);
      expect(decrypted).toEqual(arr);
    });
  });

  describe('encryptPhoneNumber', () => {
    it('should mask the middle digits before encrypting', () => {
      const phone = '96712345678';
      const encrypted = encryptPhoneNumber(phone);
      const decrypted = decryptText(encrypted);
      // The function masks: (\d{3})\d{4}(\d{4}) → $1****$2
      expect(decrypted).toBe('967****5678');
    });
  });

  describe('decryptPhoneNumber', () => {
    it('should decrypt an encrypted phone number', () => {
      const phone = '967****5678';
      const encrypted = encryptText(phone);
      const decrypted = decryptPhoneNumber(encrypted);
      expect(decrypted).toBe(phone);
    });

    it('should return empty string or fallback for garbled input', () => {
      const result = decryptPhoneNumber('not-valid-cipher');
      // CryptoJS.AES.decrypt on garbled input returns empty bytes;
      // decryptText does not throw, so decryptPhoneNumber returns the
      // empty-string result rather than hitting the catch-branch fallback.
      expect(typeof result).toBe('string');
    });
  });

  describe('encryptEmail', () => {
    it('should mask the username before encrypting', () => {
      const email = 'testuser@example.com';
      const encrypted = encryptEmail(email);
      const decrypted = decryptText(encrypted);
      expect(decrypted).toBe('te***@example.com');
    });

    it('should handle short usernames', () => {
      const email = 'ab@example.com';
      const encrypted = encryptEmail(email);
      const decrypted = decryptText(encrypted);
      expect(decrypted).toBe('ab***@example.com');
    });
  });

  describe('decryptEmail', () => {
    it('should decrypt a valid encrypted email', () => {
      const maskedEmail = 'te***@example.com';
      const encrypted = encryptText(maskedEmail);
      const decrypted = decryptEmail(encrypted);
      expect(decrypted).toBe(maskedEmail);
    });

    it('should return empty string or fallback for garbled input', () => {
      const result = decryptEmail('bad-cipher');
      // Same as decryptPhoneNumber: garbled ciphertext yields empty string
      expect(typeof result).toBe('string');
    });
  });

  describe('encryptAddress / decryptAddress', () => {
    it('should encrypt and decrypt address object', () => {
      const address = {
        street: '123 Main Street North',
        city: 'Sanaa',
        country: 'Yemen',
      };
      const encrypted = encryptAddress(address);
      const decrypted = decryptAddress(encrypted);
      // Street is truncated to first 10 chars + '***'
      expect(decrypted.street).toBe('123 Main S***');
      expect(decrypted.city).toBe('Sanaa');
      expect(decrypted.country).toBe('Yemen');
    });

    it('should return fallback on invalid address cipher', () => {
      const result = decryptAddress('bad-data');
      expect(result).toEqual({ street: '***', city: '***', country: '***' });
    });
  });

  describe('encryptPaymentData', () => {
    it('should mask card number and cvv before encrypting', () => {
      const paymentData = {
        cardNumber: '4111111111111111',
        cvv: '123',
        expiryDate: '12/25',
      };
      const encrypted = encryptPaymentData(paymentData);
      const decrypted = decryptObject(encrypted);

      // Card number: all digits except last 4 are replaced with *
      expect(decrypted.cardNumber).toBe('************1111');
      expect(decrypted.cvv).toBe('***');
      expect(decrypted.expiryDate).toBe('12/25');
    });
  });

  describe('createHash / verifyHash', () => {
    it('should produce a deterministic SHA-256 hash', () => {
      const data = 'hello world';
      const hash1 = createHash(data);
      const hash2 = createHash(data);
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(64); // SHA-256 hex
    });

    it('should produce different hashes for different inputs', () => {
      expect(createHash('a')).not.toBe(createHash('b'));
    });

    it('should verify a matching hash', () => {
      const data = 'some data';
      const hash = createHash(data);
      expect(verifyHash(data, hash)).toBe(true);
    });

    it('should reject a non-matching hash', () => {
      expect(verifyHash('data', 'wrong-hash')).toBe(false);
    });
  });

  describe('encryptForFirestore / decryptFromFirestore', () => {
    it('should encrypt specified sensitive fields and add a hash', () => {
      const data = { name: 'Ali', email: 'ali@example.com', age: 25 };
      const encrypted = encryptForFirestore(data, ['email']);

      expect(encrypted.name).toBe('Ali');
      expect(encrypted.age).toBe(25);
      expect(encrypted.email).not.toBe('ali@example.com');
      expect(encrypted._dataHash).toBeDefined();
    });

    it('should decrypt sensitive fields back', () => {
      const data = { name: 'Ali', email: 'ali@example.com', age: 25 };
      const encrypted = encryptForFirestore(data, ['email']);
      const decrypted = decryptFromFirestore(encrypted, ['email']);

      expect(decrypted.name).toBe('Ali');
      expect(decrypted.email).toBe('ali@example.com');
      expect(decrypted.age).toBe(25);
    });

    it('should handle no sensitive fields', () => {
      const data = { x: 1, y: 2 };
      const encrypted = encryptForFirestore(data, []);
      expect(encrypted.x).toBe(1);
      expect(encrypted.y).toBe(2);
      expect(encrypted._dataHash).toBeDefined();
    });

    it('should encrypt object-type sensitive fields', () => {
      const data = {
        id: '123',
        address: { street: '123 Main', city: 'Sanaa' },
      };
      const encrypted = encryptForFirestore(data, ['address']);
      expect(encrypted.id).toBe('123');
      // encryptObject converts the object to a JSON string and encrypts it
      expect(typeof encrypted.address).toBe('string');
    });

    it('should round-trip string sensitive fields through encrypt/decrypt', () => {
      const data = { id: '1', secret: 'my-secret-value' };
      const encrypted = encryptForFirestore(data, ['secret']);
      expect(encrypted.secret).not.toBe('my-secret-value');

      const decrypted = decryptFromFirestore(encrypted, ['secret']);
      expect(decrypted.secret).toBe('my-secret-value');
    });
  });
});
