# iOS image conversion issue handoff

## User-reported behavior

- On `bravoconvert.com`, an iPhone photo selected in Safari is displayed as a JPEG.
- Pressing **Convert All** does not complete the JPEG-to-PNG conversion.
- The same failure occurs in Chrome on iPhone.

## Current understanding

- iOS may transcode a HEIC photo to JPEG while passing it through the browser file picker. Seeing JPG/JPEG in the UI is therefore not necessarily a file-labeling bug in BravoConvert.
- BravoConvert itself does not currently accept or decode a file delivered as `image/heic` or with a `.heic` extension. Its accepted input formats are JPEG, PNG, and WebP.
- Chrome on iOS uses Apple's WebKit browser engine, so Safari and Chrome can be affected by the same worker/canvas compatibility issue.

## Likely conversion failure

The worker pipeline in `public/workers/image-worker.js` uses:

- `createImageBitmap(sourceBlob, { imageOrientation: 'none' })`
- `OffscreenCanvas`
- `OffscreenCanvas.convertToBlob()`

If that pipeline rejects on iOS, `convertWithWorker()` is intended to retry through `convertWithCanvas()`. However, the worker Promise is returned without being awaited inside the `try` block in `src/components/ImageConverter.tsx`. An asynchronous worker rejection therefore bypasses that `catch`, and the Canvas fallback is not invoked.

Relevant code:

- `src/components/ImageConverter.tsx`: `convertWithCanvas()` and `convertWithWorker()`
- `public/workers/image-worker.js`: `convertImage()`

## Proposed fix for the next session

1. Await the worker Promise inside `convertWithWorker()` so asynchronous rejection reaches the fallback `catch`, or attach an explicit rejection handler that invokes `convertWithCanvas()`.
2. Ensure worker initialization/runtime errors reject all affected queued conversions instead of only logging the error.
3. Preserve the original file or a copy of its bytes for fallback because the worker post transfers and detaches the original `ArrayBuffer`.
4. Consider feature detection for iOS-incompatible worker APIs and use the main-thread Canvas path immediately when required.
5. Confirm that the fallback produces an `image/png` blob and a `.png` output filename.

## Required verification

- Physical iPhone Safari: select an iPhone camera photo shown as JPEG and convert it to PNG.
- Physical iPhone Chrome: repeat the same test.
- Test portrait photos with EXIF orientations, especially orientations 6 and 8.
- Confirm the downloaded file has PNG bytes/MIME, the `.png` extension, and the correct visual orientation.
- Test one photo and multiple photos through **Convert All**.
- Test a file close to the current 10 MB per-image limit.
- Confirm desktop Chrome conversion still works and run `npm run build`.

## Important limitation

This diagnosis is based on code inspection and the user's physical-device reproduction. A physical iPhone test was not available in the current session, so the exact worker exception still needs to be captured during implementation/testing.
