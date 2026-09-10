import apiRequest from "../helpers/apiRequest";

// Every consumer must still declare its own `vi.mock("../helpers/apiRequest")`
// at the top of the test file -- Vitest only hoists a static top-level
// `vi.mock` call in the file that does the importing, so this cannot be
// moved into this helper and still take effect.
function mockApiRequest() {
  return vi.mocked(apiRequest);
}

export default mockApiRequest;
