import type { Server, ServerResponse } from 'http';
import type * as net from 'net';
import type { Session } from '@inrupt/solid-client-authn-node';
import * as open from 'open';
import { HttpLoginHandler } from '../lib/HttpLoginHandler';

let server: Server;
let requestHandler: any;
jest.mock('http', () => ({
  createServer(requestHandlerThis: any) {
    requestHandler = requestHandlerThis;
    return server;
  },
}));

jest.mock('open', () => jest.fn());

describe('HttpLoginHandler', () => {
  let handler: HttpLoginHandler;
  let socket: net.Socket;
  let session: Session;
  let res: ServerResponse;
  beforeEach(() => {
    jest.clearAllMocks();

    res = <any> {
      writeHead: jest.fn(),
      end: jest.fn(),
    };
    socket = <any> {
      destroy: jest.fn(),
    };
    server = <any> {
      listen: jest.fn(),
      on(event: string, cb: any) {
        if (event === 'connection') {
          cb(socket);
        }
      },
      close: jest.fn(),
    };
    session = <any> {
      handleIncomingRedirect: jest.fn(async() => {
        // Do nothing
      }),
      login: jest.fn((options: any) => {
        options.handleRedirect('http://example.org/authenticate');

        requestHandler({
          url: '/onLoggedIn',
        }, res);
      }),
      info: {
        isLoggedIn: true,
      },
    };
    handler = new HttpLoginHandler({
      port: 3005,
      session,
    });
  });

  describe('handleLogin', () => {
    it('handles a valid login sequence', async() => {
      await handler.handleLogin({});

      expect(server.listen).toHaveBeenCalledWith(3005);

      expect(session.login).toHaveBeenCalledWith({
        clientName: '@rubensworks/solid-node-interactive-auth',
        handleRedirect: expect.any(Function),
        redirectUrl: 'http://localhost:3005/onLoggedIn',
      });
      expect(open).toHaveBeenCalledWith('http://example.org/authenticate');
      expect(session.handleIncomingRedirect).toHaveBeenCalledWith('http://localhost:3005/onLoggedIn');
      expect(res.writeHead).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith('<script>window.close();</script>');

      expect(server.close).toHaveBeenCalledWith();
      expect(socket.destroy).toHaveBeenCalledWith();
    });

    it('handles a valid login sequence with custom options', async() => {
      const handleRedirect = jest.fn();
      await handler.handleLogin({
        clientName: 'OTHER CLIENT',
        handleRedirect,
      });

      expect(server.listen).toHaveBeenCalledWith(3005);

      expect(session.login).toHaveBeenCalledWith({
        clientName: 'OTHER CLIENT',
        handleRedirect,
        redirectUrl: 'http://localhost:3005/onLoggedIn',
      });
      expect(open).not.toHaveBeenCalled();
      expect(handleRedirect).toHaveBeenCalledWith('http://example.org/authenticate');
      expect(session.handleIncomingRedirect).toHaveBeenCalledWith('http://localhost:3005/onLoggedIn');
      expect(res.writeHead).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith('<script>window.close();</script>');

      expect(server.close).toHaveBeenCalledWith();
      expect(socket.destroy).toHaveBeenCalledWith();
    });

    it('returns 404 on invalid requests', async() => {
      await handler.handleLogin({});

      requestHandler({
        url: '/invalid',
      }, res);

      expect(res.writeHead).toHaveBeenCalledWith(404);
      expect(res.end).toHaveBeenCalledWith('This temporary server only accepts /onLoggedIn requests');
    });

    it('rejects when login has failed', async() => {
      session.info.isLoggedIn = false;
      await expect(handler.handleLogin({})).rejects.toThrowError('Login process has failed');
    });
  });
});
