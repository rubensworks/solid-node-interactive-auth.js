import * as http from 'http';
import type { Server } from 'http';
import type * as net from 'net';
import type { ILoginInputOptions } from '@inrupt/solid-client-authn-core';
import type { Session } from '@inrupt/solid-client-authn-node';
import * as open from 'open';

/**
 * Handles the Solid login process by starting a temporary HTTP server.
 */
export class HttpLoginHandler {
  private readonly port: number;
  private readonly session: Session;

  public constructor(options: IHttpLoginHandlerOptions) {
    this.port = options.port;
    this.session = options.session;
  }

  /**
   * Start a temporary HTTP server for handling the login process.
   * @param options Login options.
   */
  public async handleLogin(options: ILoginInputOptions): Promise<void> {
    // Determine login options
    options.redirectUrl = `http://localhost:${this.port}/onLoggedIn`;
    if (!options.clientName) {
      options.clientName = '@rubensworks/solid-node-interactive-auth';
    }
    if (!options.handleRedirect) {
      options.handleRedirect = redirectUrl => open(redirectUrl);
    }

    // Start temporary server
    let server: Server;
    const sockets: net.Socket[] = [];
    const onLoggedIn = new Promise((resolve, reject) => {
      server = http.createServer((req, res) => {
        if (req.url!.startsWith('/onLoggedIn')) {
          this.session.handleIncomingRedirect(`http://localhost:${this.port}${req.url}`)
            .then(resolve, reject);
          res.writeHead(200);
          res.end(`<script>window.location = new URL('http://localhost:${this.port}/done'); window.close();</script>`);
        } else if (req.url!.startsWith('/done')) {
          res.writeHead(200);
          res.end(`<script>window.close();</script>`);
        } else {
          res.writeHead(404);
          res.end(`This temporary server only accepts /onLoggedIn requests`);
        }
      });
      server.listen(this.port);

      // Avoid hanging server after close
      server.on('connection', socket => sockets.push(socket));
    });

    // Trigger login process
    await this.session.login(options);

    // Wait for server to handle incoming redirect
    await onLoggedIn;

    // Close the server
    server!.close();
    for (const socket of sockets) {
      socket.destroy();
    }

    // Ensure we are logged in
    if (!this.session.info.isLoggedIn) {
      throw new Error(`Login process has failed`);
    }
  }
}

export interface IHttpLoginHandlerOptions {
  /**
   * Port of the temporary HTTP server to start on the local host.
   */
  port: number;
  /**
   * The session to authenticate.
   */
  session: Session;
}
