/**
 * @file Defines base types for API requests and responses.
 */

export type RequestMethod = 'get' | 'patch' | 'post';

function isValidRequestMethod(value: unknown): value is RequestMethod {
  return value === 'get' || value === 'patch' || value === 'post';
}

/**
 * Base interface for requests sent to a KoLmafia relay script.
 * Loosely based on the structure of HTTP requests.
 *
 * Since KoLmafia scripts can only access URL parameters and form submission
 * parameters, `RequestBase` objects must be serialized appropriately depending
 * on the HTTP method being used.
 * As such, all additional fields must be serialized as JSON when making the
 * request.
 */
export interface RequestBase<
  Path extends string = string,
  Method extends RequestMethod = RequestMethod
> {
  /**
   * The "method" must be passed as part of the request parameters because
   * KoLmafia relay scripts cannot access the actual HTTP method of an incoming
   * request.
   */
  method: Method;
  /**
   * The resource being fetched.
   */
  path: Path;
}

function isRequestBasePropertyName(value: unknown): value is keyof RequestBase {
  return value === 'method' || value === 'path';
}

/**
 * Converts a `RequestBase` object to a flat object suitable for serialization.
 *
 * A client should serialize the returned value using `URLSearchParams()` before
 * sending it over the network.
 */
export function prepareRequestForSerialization(request: Readonly<RequestBase>) {
  const serializedRequest: Record<string, string> = {};
  for (const key of Object.keys(request)) {
    // Known keys should not be serialized, but passed as-is.
    if (isRequestBasePropertyName(key)) {
      serializedRequest[key] = request[key];
    } else {
      // All other keys should be serialized, even if their values are strings.
      // JSON.stringify() can return undefined if the input is undefined.
      // TypeScript currently doesn't check this, so we must do so manually.
      const serializedValue: string | undefined = JSON.stringify(
        (request as RequestBase & Record<string, unknown>)[key]
      );
      // Skip undefined fields
      if (serializedValue !== undefined) {
        serializedRequest[key] = serializedValue;
      }
    }
  }
  return serializedRequest;
}

/**
 * Converts a flat object to a `RequestBase`.
 *
 * A server should call this on the return value of `formFields()`
 * (analogous to `request.body` in Express.js).
 * @param wrappedRequest Wrapped request object
 * @throws {Error} If any `RequestBase` properties are missing or invalid
 */
export function unwrapDeserializedRequest(
  wrappedRequest: Readonly<Record<string, string>>
) {
  // Cast to Partial<> so that TypeScript type-checks our property access
  const uncheckedRequest = wrappedRequest as Partial<RequestBase>;

  if (typeof uncheckedRequest.method !== 'string') {
    throw new Error('Missing URL/form parameter: method');
  } else if (!isValidRequestMethod(uncheckedRequest.method)) {
    throw new Error(
      `Invalid URL/form parameter: method=${uncheckedRequest.method}`
    );
  }

  if (typeof uncheckedRequest.path !== 'string') {
    throw new Error('Missing URL/form parameter: path');
  }

  const request = {} as RequestBase & Record<string, unknown>;
  for (const key of Object.keys(wrappedRequest)) {
    // Known keys are passed as-is.
    // All other keys are deserialized.
    request[key] = isRequestBasePropertyName(key)
      ? wrappedRequest[key]
      : JSON.parse(wrappedRequest[key]);
  }
  return request as RequestBase;
}

/**
 * Base interface for successful responses from a KoLmafia relay script.
 */
export interface SuccessResponseBase {
  result: unknown;
}

/**
 * Base interface for error responses from a KoLmafia relay script.
 */
export interface ErrorResponseBase {
  error: {
    /** Integer code for the error */
    code: number;
    /** Error message for debugging */
    message: string;
  };
}

/**
 * Base interface for responses from a KoLmafia relay script.
 * Unlike `RequestBase`, this can be a free-form JSON object.
 */
export type ResponseBase = SuccessResponseBase | ErrorResponseBase;

/**
 * "Lookup" interface for routes.
 * Each route declaration in this directory should augment this interface.
 *
 * Each key must be a route string.
 * Each value must be a union of `RoutesEntry` interfaces.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Routes {}

/**
 * Generic helper interface for augmenting `Routes`.
 */
export interface RoutesEntry<
  Req extends RequestBase,
  Res extends ResponseBase
> {
  request: Req;
  response: Res;
}

/**
 * Generic type for methods that are defined for a particular path.
 */
export type RequestMethodFor<
  Path extends keyof Routes
> = Routes[Path]['request']['method'];

/**
 * Generic interface for "querying" a Request based on the path and method.
 */
// Must use dummy conditional check over RequestMethod to create unions of
// Extract<> types for each Method
export type Request<
  Path extends keyof Routes = keyof Routes,
  Method extends RequestMethodFor<Path> = RequestMethodFor<Path>
> = Extract<Routes[Path]['request'], RequestBase<Path, Method>>;

/**
 * Generic interface for "querying" a Response based on the path and method.
 */
// Since response objects do not have path or method fields, we must extract the
// associated requests first, then retrieve the responses indirectly
export type Response<
  Path extends keyof Routes = keyof Routes,
  Method extends RequestMethod = RequestMethod
> = Extract<
  Routes[Path],
  RoutesEntry<RequestBase<Path, Method>, ResponseBase>
>['response'];
