import { expect, test } from "@playwright/test";

test("известная community route показывает отдельную идентичность и набор мест", async ({ page }) => {
  await page.goto("/community/dozapravka-friends");

  await expect(page.getByRole("heading", { name: "Карта друзей Дозаправки" })).toBeVisible();
  await expect(page.getByText(/не является закрытым пространством/i)).toBeVisible();
  await expect(page.getByTestId("place-marker")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /Студия для карты сообщества/i })).toBeVisible();

  await page.getByRole("button", { name: /Студия для карты сообщества/i }).click();
  await expect(page.getByTestId("place-details-panel")).toContainText("Link-only место");
});
