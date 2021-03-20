This directory contains end-to-end test scripts for OCD-Cleanup.

To run the tests:

1. Run `yarn run build` to build all E2E test scripts.
   This will create compiled & bundled test scripts under the `build/` directory.
   (e.g. `build/ocd-test-basic.js`)
2. Copy the test script(s) to your KoLmafia's `scripts/` directory.\
   Note: You can symlink them instead to avoid copying test scripts whenever you
   rebuild them.
3. Run the test scripts inside KoLmafia.
