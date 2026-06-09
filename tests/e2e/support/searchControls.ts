import { expect, type Page } from "@playwright/test";

export async function fillSearchBox(page: Page, value: string) {
  const searchBox = page.getByRole("searchbox", { name: /Поиск/i });

  if (!(await searchBox.isVisible())) {
    await page.getByRole("button", { name: "Открыть поиск" }).click();
    await expect(searchBox).toBeVisible();
  }

  await searchBox.fill(value);
}
