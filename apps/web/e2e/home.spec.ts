import { expect, test } from "@playwright/test";

test("home page renders and reaches the database", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "浮游星 ✦ 人脈書櫃" })).toBeVisible();
  await expect(page.getByText(/資料庫連線正常/)).toBeVisible();
});
