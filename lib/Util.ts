import type { ILoginInputOptions } from '@inrupt/solid-client-authn-core';
import { Session } from '@inrupt/solid-client-authn-node';
import { HttpLoginHandler } from './HttpLoginHandler';

/**
 * Login to an existing or new session.
 * @param options Login options.
 */
export async function login(options: ILoginOptions = {}): Promise<Session> {
  const session = options.session || new Session();

  await new HttpLoginHandler({
    port: options.port || 3005,
    session,
  }).handleLogin(options);

  return session;
}

export interface ILoginOptions extends ILoginInputOptions {
  /**
   * The session to authenticate.
   */
  session?: Session;
  /**
   * Port of the temporary HTTP server to start on the local host.
   */
  port?: number;
}
