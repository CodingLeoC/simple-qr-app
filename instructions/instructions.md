# Project Overview

You are building a simple QR code generator using Next.js 15 with App Router. The app is intended to be simple and the sole purpose is to easily generate QR codes. The app should be easily extendable to add additional functionality as and when required.

# Core Functionalities

- Allow user to enter either a single URL or a list of URLs (maximum of 10).
- Generate a custom URL with unqiue ID, for example: `https://to-be-replaced.com/qr/{unique-id}`, from given URL(s).
  - {unique-id} is a server-generated ID. It can be randomly generated but must be unique accross the app. It can contains characters from the set `[a-zA-Z0-9]`. It must be a valid URL path component. It must at least be 6 characters long.
- Store the custom URL and the input URLs in the database.
- Generate a QR code for the custom URL.
- Display the QR code and let the user download it.
- When user scans the QR code and accesses the custom URL, retrive the original input URL(s) from the database. 
  - If the input was a single URL, redirect to the input URL.
  - If the input was a list of URLs, display the list of URLs.

# Additional Functionalities

- User can customize the color from a color picker, and size of the QR code, up to 4096x4096 pixels.
- User can add a logo image to the QR code. Logo image file size should be less than 1MB and allows for JPEG and PNG formats.
- App is internationalized to support English and Japanese languages. All texts visible to the user are targets of translation, including error messages.

# Security Considerations

- User input validation: Ensure that the input is a valid URL or a list of valid URLs. Do not need to test for accessibility as they might not be readily accessible.
- Input sanitization: Ensure that the input is sanitized to prevent SQL injection attacks.
- Ensure generated unique ID is unique accross the app.
- Add IP address based rate limiting to prevent brute force attacks to post input URLs. Each IP address should have a limit of 5 requests in a 1-minute window.
- Implement URL scanning/validation to prevent malicious URLs.

# Database Schema

```sql
CREATE TABLE IF NOT EXISTS urls (
  id CHAR(12) PRIMARY KEY,
  urls TEXT NOT NULL, # store as a JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(15)
);
```

# Error Handling

- When invalid URL is entered, returns `400 Bad Request` and display an error message.
- When there are more than 10 URLs entered, returns `400 Bad Request` and display an error message.
- When there are more than 5 requests from an IP address in a 1-minute window, returns `429 Too Many Requests` and display an error message.
- For any server-side error, including database errors, returns `500 Internal Server Error` and display an error message.

# Frameworks and Libraries

- [Next.js v15](https://nextjs.org/)
  - [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) for building custom API routes
  - [Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization) for implementing i18n
- [React v19](https://react.dev/reference/react)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Lucide Icons](https://lucide.dev/) for icons
- [qrcode.react](https://github.com/zpao/qrcode.react/) for generating QR codes
- [zod](https://zod.dev/) for input URL validation
- [nanoid](https://github.com/ai/nanoid) for generating unique IDs
- [sharp](https://sharp.pixelplumbing.com/) for image processing
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/start) for database interaction
- [next-i18n-router](https://github.com/i18nexus/next-i18n-router) together with [react-i18next](https://react.i18next.com/) for internationalization
- [@upstash/ratelimit](https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted) and [@upstash/redis](https://upstash.com/docs/redis/sdks/ratelimit-ts/gettingstarted) for rate limiting

**Implementation Notes and Rules:**
- We are using Next.js 15 with React 19. If errors are encountered during package installation, use `--legacy-peer-deps` flag.
- Use Route Handlers with Fetch API for server interaction, DO NOT USE server actions.
- Look into `components/ui` for UI components building blocks.
- Do not use client components whereever possible.

# Infrastructure

- [Vercel](https://vercel.com/): Host the app on Vercel.
- [Supabase](https://supabase.com/): Database to store user input and custom URLs.

# Documentation

## QR Code Generation with `qrcode.react`

Here is the [sample code](https://github.com/zpao/qrcode.react/blob/trunk/examples/download.tsx) to generate a QR code using `qrcode.react`:

```tsx
<div>
  <QRCodeSVG ref={svgRef} value="hello world" />
  <button onClick={onSVGButtonClick} style={{ display: "block" }}>
    download svg
  </button>
</div>
```

and here is how to download the QR code:

```tsx
function onSVGButtonClick() {
  const node = svgRef.current;
  if (node == null) {
    return;
  }

  // For SVG, we need to get the markup and turn it into XML.
  // Using XMLSerializer is the easiest way to ensure the markup
  // contains the xmlns. Then we make sure it gets the right DOCTYPE,
  // encode all of that to be safe to be encoded as a URI (which we
  // need to stuff into href).
  const serializer = new XMLSerializer();
  const fileURI =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      '<?xml version="1.0" standalone="no"?>' +
        serializer.serializeToString(node)
    );

  downloadStringAsFile(fileURI, "qrcode-svg.svg");
}
```

Supported [options](https://github.com/zpao/qrcode.react/tree/trunk?tab=readme-ov-file#available-props)

```tsx
type QRProps = {
  /**
   * The value to encode into the QR Code. An array of strings can be passed in
   * to represent multiple segments to further optimize the QR Code.
   */
  value: string | string[];
  /**
   * The size, in pixels, to render the QR Code.
   * @defaultValue 128
   */
  size?: number;
  /**
   * The Error Correction Level to use.
   * @see https://www.qrcode.com/en/about/error_correction.html
   * @defaultValue L
   */
  level?: 'L' | 'M' | 'Q' | 'H';
  /**
   * The background color used to render the QR Code.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
   * @defaultValue #FFFFFF
   */
  bgColor?: string;
  /**
   * The foregtound color used to render the QR Code.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
   * @defaultValue #000000
   */
  fgColor?: string;
  /**
   * Whether or not a margin of 4 modules should be rendered as a part of the
   * QR Code.
   * @deprecated Use `marginSize` instead.
   * @defaultValue false
   */
  includeMargin?: boolean;
  /**
   * The number of _modules_ to use for margin. The QR Code specification
   * requires `4`, however you can specify any number. Values will be turned to
   * integers with `Math.floor`. Overrides `includeMargin` when both are specified.
   * @defaultValue 0
   */
  marginSize?: number;
  /**
   * The title to assign to the QR Code. Used for accessibility reasons.
   */
  title?: string;
  /**
   * The minimum version used when encoding the QR Code. Valid values are 1-40
   * with higher values resulting in more complex QR Codes. The optimal
   * (lowest) version is determined for the `value` provided, using `minVersion`
   * as the lower bound.
   * @defaultValue 1
   */
  minVersion?: number;
  /**
   * If enabled, the Error Correction Level of the result may be higher than
   * the specified Error Correction Level option if it can be done without
   * increasing the version.
   * @defaultValue true
   */
  boostLevel?: boolean;
  /**
   * The settings for the embedded image.
   */
  imageSettings?: {
    /**
     * The URI of the embedded image.
     */
    src: string;
    /**
     * The height, in pixels, of the image.
     */
    height: number;
    /**
     * The width, in pixels, of the image.
     */
    width: number;
    /**
     * Whether or not to "excavate" the modules around the embedded image. This
     * means that any modules the embedded image overlaps will use the background
     * color.
     */
    excavate: boolean;
    /**
     * The horiztonal offset of the embedded image, starting from the top left corner.
     * Will center if not specified.
     */
    x?: number;
    /**
     * The vertical offset of the embedded image, starting from the top left corner.
     * Will center if not specified.
     */
    y?: number;
    /**
     * The opacity of the embedded image in the range of 0-1.
     * @defaultValue 1
     */
    opacity?: number;
    /**
     * The cross-origin value to use when loading the image. This is used to
     * ensure compatibility with CORS, particularly when extracting image data
     * from QRCodeCanvas.
     * Note: `undefined` is treated differently than the seemingly equivalent
     * empty string. This is intended to align with HTML behavior where omitting
     * the attribute behaves differently than the empty string.
     */
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  };
};
```

# Current File Structure

```
.
├── app
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── ui
├── components.json
├── eslint.config.mjs
├── instructions
│   └── instructions.md
├── lib
│   └── utils.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```
