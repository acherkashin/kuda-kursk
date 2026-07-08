import { expect, type Page } from "@playwright/test";

export async function fillSearchBox(page: Page, value: string) {
  const searchBox = page.getByRole("searchbox", { name: /Поиск/i });
  const openSearchButton = page.getByRole("button", { name: "Открыть поиск" });

  await expect(searchBox.or(openSearchButton).first()).toBeVisible();

  if (!(await searchBox.isVisible())) {
    await openSearchButton.click();
    await expect(searchBox).toBeVisible();
  }

  await searchBox.fill(value);
}
