/**
 * Ref:
 * https://github.com/mswjs/examples/blob/master/examples/with-jest/jest.setup.js
 *
 */

// Polyfill "window.fetch" used in the React component.
import "whatwg-fetch";

import "@testing-library/jest-dom/extend-expect";

import { server } from "./__mocks__/server";

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});