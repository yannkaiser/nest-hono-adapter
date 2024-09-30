import { createServer as createHttpsServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { AbstractHttpAdapter } from '@nestjs/core';
import {
  Logger,
  NestApplicationOptions,
  RequestMethod,
  VersioningOptions,
} from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { VersionValue } from '@nestjs/common/interfaces';
import { Context, Hono } from 'hono';
import { createAdaptorServer } from '@hono/node-server';
import { ServerType } from '@hono/node-server/dist/types';
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';
import { StatusCode } from 'hono/dist/types/utils/http-status';
import { cors } from 'hono/cors';
import { isObject } from '@nestjs/common/utils/shared.utils';

type VersionedRoute = <
  TRequest extends Record<string, any> = any,
  TResponse = any,
>(
  req: TRequest,
  res: TResponse,
  next: () => void,
) => any;

interface HonoAdapterOptions {
  httpsOptions?: HttpsOptions;
}

interface ContextWrapper {
  context: Context;
  res: Response;
}

declare module 'hono' {
  interface HonoRequest {
    body: any;
  }
}

export class HonoAdapter extends AbstractHttpAdapter<ServerType> {
  protected readonly instance: Hono;

  private readonly logger = new Logger(HonoAdapter.name);
  private adapterOptions: HonoAdapterOptions;

  constructor(instance?: Hono) {
    super(instance || new Hono());
  }

  close() {
    if (!this.httpServer) {
      return undefined;
    }

    return new Promise((resolve) => this.httpServer.close(resolve));
  }

  public listen(port: string | number, callback?: () => void): ServerType;
  public listen(
    port: string | number,
    hostname: string,
    callback?: () => void,
  ): ServerType;
  public listen(port: any, ...args: any[]): ServerType {
    return this.httpServer.listen(port, ...args);
  }

  initHttpServer(options: NestApplicationOptions): any {
    this.adapterOptions = {
      httpsOptions: options.httpsOptions,
    };

    if (options && options.httpsOptions) {
      this.httpServer = createAdaptorServer({
        fetch: this.instance.fetch,
        createServer: createHttpsServer,
        serverOptions: this.adapterOptions.httpsOptions,
      });
    } else {
      this.httpServer = createAdaptorServer({
        fetch: this.instance.fetch,
        createServer: createHttpServer,
      });
    }
  }

  useStaticAssets(...args: any[]): any {
    this.logger.warn('useStaticAssets not implemented');
  }

  setViewEngine(engine: string): any {
    this.logger.warn('setViewEngine not implemented');
  }

  getRequestHostname(request: any): any {
    this.logger.warn('getRequestHostname not implemented');
  }

  getRequestMethod(request: any): any {
    return request.method;
  }

  getRequestUrl(request: any): any {
    return request.url;
  }

  status(wrapper: ContextWrapper, statusCode?: StatusCode): any {
    wrapper.context.status(statusCode);
  }

  async reply(wrapper: ContextWrapper, body: any, statusCode?: StatusCode) {
    if (statusCode) {
      wrapper.context.status(statusCode);
    }

    if (isObject(body)) {
      wrapper.res = wrapper.context.json(body);
    } else {
      wrapper.res = wrapper.context.text(body);
      if (!wrapper.context.res.headers.has('Content-Length')) {
        wrapper.context.header('Content-Length', body.length);
      }
    }
    return wrapper.res;
  }

  end(wrapper: ContextWrapper, message?: string): any {
    this.logger.warn(`end is not implemented`);
  }

  render(response: any, view: string, options: any): any {
    this.logger.warn(`render is not implemented`);
  }

  redirect(response: any, statusCode: number, url: string): any {
    this.logger.warn(`redirect is not implemented`);
  }

  setErrorHandler(handler: Function, prefix?: string): any {
    this.instance.onError(async (err, c) => {
      const wrapper = this.wrapContext(c);
      await handler(err, c.req, wrapper);
      return wrapper.res;
    });
  }

  setNotFoundHandler(handler: Function, prefix?: string): any {
    this.logger.warn(`setNotFoundHandler is not implemented`);
  }

  isHeadersSent(response: any): any {
    this.logger.warn(`isHeadersSent is not implemented`);
  }

  getHeader?(context: Context, name: string): any {
    return context.res.headers.get(name);
  }

  setHeader(context: Context, name: string, value: string): any {
    return context.res.headers.set(name, value);
  }

  get(...args: any[]) {
    return this.injectRoute('get', ...args);
  }

  post(...args: any[]) {
    return this.injectRoute('post', ...args);
  }

  private injectRoute(
    routerMethodKey:
      | 'get'
      | 'post'
      | 'put'
      | 'delete'
      | 'options'
      | 'patch'
      | 'head',
    ...args: any[]
  ) {
    const path = args[0];
    const handlerRef = args[args.length - 1];

    return this.instance[routerMethodKey](
      path,
      async (c: Context, next: any) => {
        const wrapper = this.wrapContext(c);
        await handlerRef(c.req, wrapper, next);
        return wrapper.res;
      },
    );
  }

  private wrapContext(context: Context): ContextWrapper {
    return {
      context,
      res: null,
    };
  }

  appendHeader?(context: Context, name: string, value: string): any {
    return context.res.headers.append(name, value);
  }

  registerParserMiddleware(prefix?: string, rawBody?: boolean): any {
    this.logger.warn(`registerParserMiddleware is partially implemented`);
    this.instance.use(async (c, next) => {
      const contentType = c.req.header('Content-Type');
      const length = +c.req.header('Content-Length');

      if (length > 0 && !!c.req.raw.body) {
        if (contentType === 'application/json') {
          c.req.body = await c.req.json();
        } else {
          c.req.body = await c.req.text();
        }
      }
      await next();
    });
  }

  enableCors(options: CorsOptions, prefix?: string): any {
    const callback =
      typeof options === 'function'
        ? options
        : (_req: any, cb: any) => {
            return cb(null, options);
          };

    this.instance.use(async (c, next) => {
      return callback(c, async (_err: any, options: CorsOptions) => {
        const middlewareOptions: any = {};
        options?.origin && (middlewareOptions.origin = options.origin);
        options?.allowedHeaders &&
          (middlewareOptions.allowHeaders = [
            ...(options.allowedHeaders ?? []),
          ]);
        options?.maxAge && (middlewareOptions.maxAge = options.maxAge);
        options?.credentials &&
          (middlewareOptions.credentials = options.credentials);
        options?.methods &&
          (middlewareOptions.allowMethods = [
            ...(options.allowedHeaders ?? []),
          ]);
        options?.exposedHeaders &&
          (middlewareOptions.exposeHeaders = [
            ...(options.exposedHeaders ?? []),
          ]);

        return cors(middlewareOptions)(c, next);
      });
    });
  }

  createMiddlewareFactory(
    requestMethod: RequestMethod,
  ):
    | ((path: string, callback: Function) => any)
    | Promise<(path: string, callback: Function) => any> {
    this.logger.warn(`createMiddlewareFactory is not implemented`);
    return null;
  }

  getType(): string {
    return 'hono';
  }

  applyVersionFilter(
    handler: Function,
    version: VersionValue,
    versioningOptions: VersioningOptions,
  ): VersionedRoute {
    this.logger.warn(`applyVersionFilter is not implemented`);
    return null;
  }
}
