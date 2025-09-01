// Next.js 15 API Route Parameter Types
export type NextApiParams<T = Record<string, string>> = Promise<T>;

// Helper type for API route functions
export type ApiRouteHandler<T = Record<string, string>> = (
  req: Request,
  context: { params: NextApiParams<T> }
) => Promise<Response>;
