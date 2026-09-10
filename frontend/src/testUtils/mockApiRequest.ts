import apiRequest from "../helpers/apiRequest";

function mockApiRequest() {
  const mocked = vi.mocked(apiRequest);

  beforeEach(() => {
    mocked.mockReset();
  });

  return mocked;
}

export default mockApiRequest;
