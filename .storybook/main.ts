import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import type { PluginOption } from "vite";

function isNamedPlugin(plugin: PluginOption): plugin is { name: string } {
  return typeof plugin === "object" && plugin !== null && "name" in plugin;
}

function isPwaPlugin(plugin: PluginOption): boolean {
  return isNamedPlugin(plugin) && plugin.name.startsWith("vite-plugin-pwa");
}

function isTailwindPlugin(plugin: PluginOption): boolean {
  return isNamedPlugin(plugin) && plugin.name.startsWith("@tailwindcss/vite");
}

function removePwaPlugins(plugins: PluginOption[]): PluginOption[] {
  return plugins
    .map((plugin) => (Array.isArray(plugin) ? removePwaPlugins(plugin) : plugin))
    .filter((plugin) => !isPwaPlugin(plugin));
}

function hasTailwindPlugin(plugins: PluginOption[]): boolean {
  return plugins.some((plugin) => (Array.isArray(plugin) ? hasTailwindPlugin(plugin) : isTailwindPlugin(plugin)));
}

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    const plugins = removePwaPlugins(config.plugins ?? []);

    return {
      ...config,
      plugins: hasTailwindPlugin(plugins) ? plugins : [...plugins, tailwindcss()]
    };
  }
};

export default config;
