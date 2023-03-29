// import { ColorModeScript } from "@chakra-ui/react";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body
        {...{
          "data-theme": "dark",
          style: { colorScheme: "dark" },
        }}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
