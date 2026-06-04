import type { Preview } from "@storybook/react-vite";

import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    backgrounds: {
      default: "Кремовый фон",
      values: [
        { name: "Кремовый фон", value: "#F2EDE6" },
        { name: "Поверхность", value: "#FDFAF6" },
        { name: "Белый", value: "#FFFFFF" }
      ]
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
