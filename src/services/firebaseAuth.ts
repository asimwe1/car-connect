import { 
  signInWithPhoneNumber, 
  PhoneAuthProvider, 
  signInWithCredential,
  RecaptchaVerifier,
  ConfirmationResult,
  User
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// Feature flag: allow using a fake OTP flow when Firebase is not configured
const USE_FAKE_OTP = (import.meta as any)?.env?.VITE_USE_FAKE_OTP === 'true';

// Test phone numbers for development (no SMS charges)
const TEST_PHONE_NUMBERS = [
  '+250788881400', // Admin number 1
  '+250793373953', // Admin number 2
  '+16505551234',  // Test number 1
  '+16505551235',  // Test number 2
];

// Test verification codes for development
const TEST_VERIFICATION_CODES = {
  '+250788881400': '123456',
  '+250793373953': '123456',
  '+16505551234': '123456',
  '+16505551235': '123456',
};

export class FirebasePhoneAuth {
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  constructor() {
    // Disable app verification for testing (only in development)
    if (process.env.NODE_ENV === 'development') {
      (auth as any).settings.appVerificationDisabledForTesting = true;
    }
  }

  // Initialize reCAPTCHA verifier
  initializeRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
    this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });

    return this.recaptchaVerifier;
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    // In FAKE OTP mode, skip requiring reCAPTCHA entirely to avoid Firebase calls
    if (!this.recaptchaVerifier && !USE_FAKE_OTP) {
      throw new Error('reCAPTCHA verifier not initialized');
    }

    try {
      // Check if it's a test number
      if (TEST_PHONE_NUMBERS.includes(phoneNumber)) {
        console.log(`Test phone number detected: ${phoneNumber}`);
        console.log(`Use verification code: ${TEST_VERIFICATION_CODES[phoneNumber as keyof typeof TEST_VERIFICATION_CODES] || '123456'}`);
      }

      // If fake mode enabled, short-circuit and simulate a ConfirmationResult
      if (USE_FAKE_OTP) {
        console.warn('[OTP] Using FAKE OTP flow (VITE_USE_FAKE_OTP=true). No SMS will be sent.');
        this.confirmationResult = {
          // Minimal shape for what we use later
          confirm: async (code: string) => {
            const expected = TEST_VERIFICATION_CODES[phoneNumber as keyof typeof TEST_VERIFICATION_CODES] || '123456';
            if (code !== expected) {
              // mimic Firebase behavior
              throw Object.assign(new Error('Invalid verification code'), { code: 'auth/invalid-verification-code' });
            }
            // Return a minimal user-like object
            return { user: { phoneNumber } as unknown as User } as unknown as any;
          }
        } as unknown as ConfirmationResult;
        return this.confirmationResult;
      }

      this.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier!);
      return this.confirmationResult;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      // If Firebase is misconfigured (e.g., invalid api key), fallback to FAKE OTP automatically
      const code: string | undefined = error?.code;
      const apiKeyInvalid = code === 'auth/api-key-not-valid' || /api-key/i.test(String(error?.message || ''));
      if (apiKeyInvalid || USE_FAKE_OTP) {
        console.warn('[OTP] Falling back to FAKE OTP due to Firebase configuration issue.');
        this.confirmationResult = {
          confirm: async (codeInput: string) => {
            const expected = TEST_VERIFICATION_CODES[phoneNumber as keyof typeof TEST_VERIFICATION_CODES] || '123456';
            if (codeInput !== expected) {
              throw Object.assign(new Error('Invalid verification code'), { code: 'auth/invalid-verification-code' });
            }
            return { user: { phoneNumber } as unknown as User } as unknown as any;
          }
        } as unknown as ConfirmationResult;
        return this.confirmationResult;
      }

      throw new Error(this.getErrorMessage(code || ''));
    }
  }

  // Verify OTP code
  async verifyOTP(verificationCode: string): Promise<User> {
    if (!this.confirmationResult) {
      throw new Error('No confirmation result available. Please send OTP first.');
    }

    try {
      const result = await this.confirmationResult.confirm(verificationCode);
      return result.user;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Check if phone number is admin number (bypass OTP in production)
  isAdminNumber(phoneNumber: string): boolean {
    const adminNumbers = ['+250788881400', '+250793373953'];
    return adminNumbers.includes(phoneNumber);
  }

  // Admin bypass verification (for production)
  async adminBypass(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    if (!this.isAdminNumber(phoneNumber)) {
      return { success: false, message: 'Not an admin number' };
    }

    // In production, you might want to implement additional security checks
    // For now, we'll return success for admin numbers
    return { 
      success: true, 
      message: 'Admin access granted. OTP verification bypassed.' 
    };
  }

  // Clean up reCAPTCHA verifier
  cleanup(): void {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }

  // Get user-friendly error messages
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-phone-number': 'Invalid phone number format',
      'auth/too-many-requests': 'Too many requests. Please try again later',
      'auth/invalid-verification-code': 'Invalid verification code',
      'auth/code-expired': 'Verification code has expired',
      'auth/session-expired': 'Session expired. Please try again',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/quota-exceeded': 'SMS quota exceeded. Please try again later',
      'auth/captcha-check-failed': 'reCAPTCHA verification failed',
      'auth/invalid-app-credential': 'Invalid app credential',
      'auth/missing-app-credential': 'Missing app credential',
      'auth/invalid-verification-id': 'Invalid verification ID',
      'auth/missing-verification-id': 'Missing verification ID',
      'auth/missing-verification-code': 'Please enter the verification code',
    };

    return errorMessages[errorCode] || 'An error occurred during authentication';
  }
}

// Export singleton instance
export const firebasePhoneAuth = new FirebasePhoneAuth();
