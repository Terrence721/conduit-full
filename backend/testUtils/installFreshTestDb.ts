import testDbModule from "./testDb";

const { installTestDb } = testDbModule;

// Registers the "../models" mock for this test's db, then clears the
// module cache so a fresh dynamic import() afterward re-evaluates against
// it instead of a previous test's cached instance.
const installFreshTestDb = (db: any) => {
  installTestDb(db);
  vi.resetModules();
};

export = installFreshTestDb;
