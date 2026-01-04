import type { ApiErrorResponseBody } from "../global-interfaces";

const HTTP_STATUS = {
  "200-ok": 200,
  "201-created": 201,
  "202-accepted": 202,
  "203-nonAuthoritativeInformation": 203,
  "204-noContent": 204,
  "205-resetContent": 205,
  "206-partialContent": 206,
  "207-multiStatus": 207,
  "208-alreadyReported": 208,
  "226-imUsed": 226,
  "400-badRequest": 400,
  "401-unauthorized": 401,
  "402-paymentRequired": 402,
  "403-forbidden": 403,
  "404-notFound": 404,
  "405-methodNotAllowed": 405,
  "406-notAcceptable": 406,
  "407-proxyAuthenticationRequired": 407,
  "408-requestTimeout": 408,
  "409-conflict": 409,
  "410-gone": 410,
  "411-lengthRequired": 411,
  "412-preconditionFailed": 412,
  "413-contentTooLarge": 413,
  "414-uriTooLong": 414,
  "415-unsupportedMediaType": 415,
  "416-rangeNotSatisfiable": 416,
  "417-expectationFailed": 417,
  "418-imATeapot": 418,
  "421-misdirectedRequest": 421,
  "422-unprocessableContent": 422,
  "423-locked": 423,
  "424-failedDependency": 424,
  "425-tooEarly": 425,
  "426-upgradeRequired": 426,
  "428-preconditionRequired": 428,
  "429-tooManyRequests": 429,
  "431-requestHeaderFieldsTooLarge": 431,
  "451-unavailableForLegalReasons": 451,
  "500-internalServerError": 500,
  "501-notImplemented": 501,
  "502-badGateway": 502,
  "503-serviceUnavailable": 503,
  "504-gatewayTimeout": 504,
  "505-httpVersionNotSupported": 505,
  "506-variantAlsoNegotiates": 506,
  "507-insufficientStorage": 507,
  "508-loopDetected": 508,
  "510-notExtended": 510,
  "511-networkAuthenticationRequired": 511,
};

export class MlkApiResponse {
  private _fineGrainedHeaders: Headers | null = null;
  private _fineGrainedStatus: number | null = null;
  private _defaultHeaders: Headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  public status(status: keyof typeof HTTP_STATUS) {
    this._fineGrainedStatus = HTTP_STATUS[status];
    return this;
  }

  public headers(headers: Headers) {
    if (!this._fineGrainedHeaders) {
      this._fineGrainedHeaders = new Headers(headers);
    } else {
      for (const [key, val] of headers) {
        this._fineGrainedHeaders.set(key, val);
      }
    }
    return this;
  }

  public defaultRequestError(err: ApiErrorResponseBody) {
    return new Response(JSON.stringify(err), {
      status: this._fineGrainedStatus ?? HTTP_STATUS["400-badRequest"],
      headers: mergeHeaders(this._defaultHeaders, this._fineGrainedHeaders),
    });
  }

  public defaultServerError(err: ApiErrorResponseBody) {
    return new Response(JSON.stringify(err), {
      status: this._fineGrainedStatus ?? HTTP_STATUS["500-internalServerError"],
      headers: mergeHeaders(this._defaultHeaders, this._fineGrainedHeaders),
    });
  }

  public json(body: object) {
    return new Response(JSON.stringify(body), {
      status: this._fineGrainedStatus ?? HTTP_STATUS["200-ok"],
      headers: mergeHeaders(this._defaultHeaders, this._fineGrainedHeaders),
    });
  }
}

function mergeHeaders(headers: Headers | null, prevalentHeaders: Headers | null) {
  return new Headers([...(headers?.entries() ?? []), ...(prevalentHeaders?.entries() ?? [])]);
}
