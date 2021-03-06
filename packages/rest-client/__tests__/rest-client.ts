import fetch from 'node-fetch';
import { RestClient } from '../src/rest-client';

window.fetch = jest.fn().mockImplementation(() => ({
  status: 200,
  json: jest.fn().mockImplementation(() => ({ test: 'test' })),
}));

window.Headers = fetch.Headers;

const restClient = new RestClient({
  apiHost: 'http://localhost:3000/',
  rootPath: 'accounts',
});
restClient.client = {
  refreshSession: jest.fn(),
} as any;

describe('RestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have a way to configure api host address and root path', () => {
    expect(restClient.options.apiHost).toBe('http://localhost:3000/');
    expect(restClient.options.rootPath).toBe('accounts');

    return restClient.fetch('try', {}).then(() => {
      expect(window.fetch.mock.calls[0][0]).toBe('http://localhost:3000/accounts/try');
    });
  });

  describe('fetch', () => {
    it('should enable custom headers', () =>
      restClient
        .fetch('route', {}, { origin: 'localhost:3000' })
        .then(() => expect(window.fetch.mock.calls[0][1].headers.origin).toBe('localhost:3000')));

    it('should throw error', async () => {
      window.fetch = jest.fn().mockImplementation(() => ({
        status: 400,
        json: jest.fn().mockImplementation(() => ({ test: 'test' })),
      }));

      try {
        await restClient.fetch('route', {}, { origin: 'localhost:3000' });
        throw new Error();
      } catch (err) {
        expect(window.fetch.mock.calls[0][1].headers.origin).toBe('localhost:3000');
      }
      window.fetch = jest.fn().mockImplementation(() => ({
        status: 200,
        json: jest.fn().mockImplementation(() => ({ test: 'test' })),
      }));
    });

    it('should throw if server did not return a response', async () => {
      window.fetch = jest.fn().mockImplementation(() => null);

      try {
        await restClient.fetch('route', {}, { origin: 'localhost:3000' });
        throw new Error();
      } catch (err) {
        expect(window.fetch.mock.calls[0][1].headers.origin).toBe('localhost:3000');
        expect(err.message).toBe('Server did not return a response');
      }
      window.fetch = jest.fn().mockImplementation(() => ({
        status: 200,
        json: jest.fn().mockImplementation(() => ({ test: 'test' })),
      }));
    });
  });

  describe('loginWithService', () => {
    it('should call fetch with authenticate path', async () => {
      await restClient.loginWithService('password', {
        user: {
          username: 'toto',
        },
        password: 'password',
      });
      expect(window.fetch.mock.calls[0][0]).toBe(
        'http://localhost:3000/accounts/password/authenticate'
      );
      expect(window.fetch.mock.calls[0][1].body).toBe(
        '{"user":{"username":"toto"},"password":"password"}'
      );
    });
  });

  describe('impersonate', () => {
    it('should call fetch with impersonate path', () =>
      restClient
        .impersonate('token', 'user')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe('http://localhost:3000/accounts/impersonate')
        ));
  });

  describe('refreshTokens', () => {
    it('should call fetch with refreshTokens path', () =>
      restClient
        .refreshTokens('accessToken', 'refreshToken')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe('http://localhost:3000/accounts/refreshTokens')
        ));
  });

  describe('logout', () => {
    it('should call fetch with logout path', () =>
      restClient
        .logout('accessToken')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe('http://localhost:3000/accounts/logout')
        ));
  });

  describe('getUser', () => {
    it('should call fetch with user path', () =>
      restClient
        .getUser('accessToken')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe('http://localhost:3000/accounts/user')
        ));
  });

  describe('createUser', () => {
    it('should call fetch with register path', () =>
      restClient
        .createUser('user')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/register'
          )
        ));
  });

  describe('resetPassword', () => {
    it('should call fetch with resetPassword path', () =>
      restClient
        .resetPassword('token', 'resetPassword')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/resetPassword'
          )
        ));
  });

  describe('verifyEmail', () => {
    it('should call fetch with verifyEmail path', () =>
      restClient
        .verifyEmail('token')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/verifyEmail'
          )
        ));
  });

  describe('sendVerificationEmail', () => {
    it('should call fetch with verifyEmail path', () =>
      restClient
        .sendVerificationEmail('email')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/sendVerificationEmail'
          )
        ));
  });

  describe('sendResetPasswordEmail', () => {
    it('should call fetch with verifyEmail path', () =>
      restClient
        .sendResetPasswordEmail('email')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/sendResetPasswordEmail'
          )
        ));
  });

  describe('changePassword', () => {
    it('should call fetch with changePassword path', () =>
      restClient
        .changePassword('oldPassword', 'newPassword')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/changePassword'
          )
        ));
  });

  describe('getTwoFactorSecret', () => {
    it('should call fetch with verifyEmail path', () =>
      restClient
        .getTwoFactorSecret()
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/twoFactorSecret'
          )
        ));
  });

  describe('twoFactorSet', () => {
    it('should call fetch with verifyEmail path', () =>
      restClient
        .twoFactorSet('secret', 'code')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/twoFactorSet'
          )
        ));
  });

  describe('twoFactorUnset', () => {
    it('should call fetch with verifyEmail path', () =>
      restClient
        .twoFactorUnset('code')
        .then(() =>
          expect(window.fetch.mock.calls[0][0]).toBe(
            'http://localhost:3000/accounts/password/twoFactorUnset'
          )
        ));
  });
});
