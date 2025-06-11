export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
};

// errorCodes.js

export const ERROR_CODES = {
  AUTH: {
    TOKEN_EXPIRED: 'AUTH001',
    INVALID_TOKEN: 'AUTH002',
    REFRESH_EXPIRED: 'AUTH003',
    USER_NOT_FOUND: 'AUTH004',
    TOKEN_MISSING: 'AUTH005',
  },
  TWO_FA: {
    TOKEN_MISSING: '2FA001',
    INVALID_CODE: '2FA002',
  },
  USER: {
    DUPLICATE_EMAIL_USERNAME: 'USER001',
    PASSWORD_MISMATCH: 'USER002',
    INVALID_PASSWORD: 'USER003',
    NOT_FOUND: 'USER004',
  },
  VALIDATION: {
    INVALID_EMAIL: 'VAL001',
    MISSING_FIELDS: 'VAL002',
  },
  SERVER: {
    UNKNOWN_ERROR: 'SRV001',
    DATABASE_ERROR: 'SRV002',
  },
};
