/**
 * @file Basic type-safe routing framework built on top of universal-router.
 */

import {
  ErrorResponseBase,
  Request,
  RequestBase,
  RequestMethodFor,
  Response,
  ResponseBase,
  Routes,
} from '@philter/common';
import UniversalRouterSync from 'universal-router/sync';

/**
 * Custom context object interface.
 */
interface CustomContext {
  content: RequestBase;
}

/**
 * Utility function for validating a context object that universal-router passes
 * to each route handler.
 */
function isValidContext<Path extends keyof Routes>(
  context: unknown
): context is {content: Request<Path>} {
  return (
    typeof context === 'object' && context !== null && 'content' in context
  );
}

export type RouteHandler<
  Path extends keyof Routes,
  Method extends RequestMethodFor<Path>
> = (
  request: Request<Path, Method>
) => Response<Path, Method> | ErrorResponseBase;

/**
 * Creates a route for typed-router in a declarative, type-safe manner.
 * @param path Route path (must be defined in `common` package).
 * @param handlers Object containing handlers for each method type.
 *    Each handler must return a valid response object.
 */
export function createRoute<Path extends keyof Routes>(
  path: Path,
  handlers: {[Method in RequestMethodFor<Path>]: RouteHandler<Path, Method>}
) {
  return {
    path,
    action(context: unknown) {
      if (!isValidContext<Path>(context)) {
        throw new Error('Invalid context');
      }

      const method = context.content.method;
      if (Object.prototype.hasOwnProperty.call(handlers, method)) {
        const handler = handlers[method as keyof typeof handlers];
        return handler(context.content);
      } else {
        return {
          error: {
            code: 405,
            message: 'Method not allowed',
            content: JSON.stringify(context.content),
          },
        };
      }
    },
  };
}

/**
 * Dummy class that only exists so that we can extract the constructor
 * parameters of UniversalRouter. This is necessary because TypeScript does not
 * allow extracting the constructor parameter types of a generic class, i.e.
 * ```ts
 * ConstructorParameters<typeof UniversalRouterSync<ResponseBase, CustomContext>>
 * ```
 * does not work.
 */
declare class TypedRouterDummy extends UniversalRouterSync<
  ResponseBase,
  CustomContext
> {}

/**
 * Factory function for typed-router.
 * @param routes A route or an array of routes created with `createRoute()`
 * @param options Options object for universal-router. Note that typed-router
 *    provides an error handler so you don't have to.
 */
export function createRouter(
  ...args: ConstructorParameters<typeof TypedRouterDummy>
) {
  const [routes, options, ...restArgs] = args;
  return new UniversalRouterSync<ResponseBase, CustomContext>(
    routes,
    {
      errorHandler(error) {
        return {error: {code: error.status || 500, message: error.message}};
      },
      ...options,
    },
    ...restArgs
  );
}
