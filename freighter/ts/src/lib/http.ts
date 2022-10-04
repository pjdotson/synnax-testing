import axios, { AxiosRequestConfig } from 'axios';
import { ZodSchema } from 'zod';

import { EncoderDecoder } from './encoder';
import { decodeError, ErrorPayloadSchema } from './errors';
import { MetaData, MiddlewareCollector } from './middleware';
import { UnaryClient } from './unary';
import URL from './url';

/**
 * HTTPClientFactory provides a POST and GET implementation of the Unary
 * protocol.
 *
 * @param url - The base URL of the API.
 * @param encoder - The encoder/decoder to use for the request/response.
 */
export class HTTPClientFactory extends MiddlewareCollector {
  endpoint: URL;
  encoder: EncoderDecoder;

  constructor(endpoint: URL, encoder: EncoderDecoder) {
    super();
    this.endpoint = endpoint;
    this.encoder = encoder;
  }

  getClient(): GETClient {
    const gc = new GETClient(this.endpoint, this.encoder);
    gc.use(...this.middleware);
    return gc;
  }

  postClient(): POSTClient {
    const pc = new POSTClient(this.endpoint, this.encoder);
    pc.use(...this.middleware);
    return pc;
  }
}

export const CONTENT_TYPE_HEADER_KEY = 'Content-Type';

class Core extends MiddlewareCollector {
  endpoint: URL;
  encoder: EncoderDecoder;

  constructor(endpoint: URL, encoder: EncoderDecoder) {
    super();
    this.endpoint = endpoint.replace({ protocol: 'http' });
    this.encoder = encoder;
  }

  get headers() {
    return {
      [CONTENT_TYPE_HEADER_KEY]: this.encoder.contentType,
    };
  }

  requestConfig(): AxiosRequestConfig {
    return {
      headers: this.headers,
      responseType: 'arraybuffer',
      withCredentials: false,
      validateStatus: () => true,
    };
  }

  async execute<RS>(
    request: AxiosRequestConfig,
    resSchema: ZodSchema<RS>
  ): Promise<[RS | undefined, Error | undefined]> {
    let rs: RS | undefined = undefined;

    if (!request.url)
      throw new Error('[freighter.http] - expected valid request url');

    const err = await this.executeMiddleware(
      { target: request.url, protocol: 'http', params: {} },
      async (md: MetaData): Promise<Error | undefined> => {
        request.headers = { ...request.headers, ...this.headers, ...md.params };
        const httpRes = await axios.request(request);
        if (httpRes.status < 200 || httpRes.status >= 300) {
          try {
            const err = this.encoder.decode(httpRes.data, ErrorPayloadSchema);
            return decodeError(err);
          } catch {
            return new Error(httpRes.data);
          }
        }
        rs = this.encoder.decode(httpRes.data, resSchema);
        return undefined;
      }
    );

    return [rs, err];
  }
}

/**
 * Implementation of the UnaryClient protocol backed by HTTP GET requests. It
 * should not be instantiated directly, but through the HTTPClientFactory.
 */
export class GETClient extends Core implements UnaryClient {
  async send<RQ, RS>(
    target: string,
    req: RQ,
    resSchema: ZodSchema<RS>
  ): Promise<[RS | undefined, Error | undefined]> {
    const request = this.requestConfig();
    request.method = 'GET';
    request.url =
      this.endpoint.child(target).stringify() +
      buildQueryString({ request: req as Record<string, unknown> });
    return await this.execute(request, resSchema);
  }
}

/**
 * Implementation of the UnaryClient protocol backed by HTTP POST requests. It
 * should not be instantiated directly, but through the HTTPClientFactory.
 */
export class POSTClient extends Core implements UnaryClient {
  async send<RQ, RS>(
    target: string,
    req: RQ,
    resSchema: ZodSchema<RS>
  ): Promise<[RS | undefined, Error | undefined]> {
    const url = this.endpoint.child(target).stringify();
    const request = this.requestConfig();
    request.method = 'POST';
    request.url = url;
    request.data = this.encoder.encode(req);
    return await this.execute(request, resSchema);
  }
}

export const buildQueryString = ({
  request,
  prefix = '',
}: {
  request: Record<string, unknown>;
  prefix?: string;
}) => {
  return (
    '?' +
    Object.keys(request)
      .map((key) => `${prefix}${key}=${request[key]}`)
      .join('&')
  );
};
