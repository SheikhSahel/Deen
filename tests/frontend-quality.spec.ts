import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/quran", "/hadith", "/qibla"];

test.beforeEach(async ({ page }) => {
  await page.route("**/api/prayer-times**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          timings: {
            Fajr: "05:00",
            Dhuhr: "12:15",
            Asr: "15:45",
            Maghrib: "18:10",
            Isha: "19:40",
          },
          date: {
            readable: "26-02-2026",
            hijri: {
              date: "08-09-1447",
              month: { en: "Ramadan", number: 9 },
              year: "1447",
            },
          },
          meta: { timezone: "Asia/Riyadh" },
        },
      }),
    });
  });

  await page.route("**/api.alquran.cloud/v1/surah", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            number: 1,
            name: "الفاتحة",
            englishName: "Al-Faatiha",
            englishNameTranslation: "The Opening",
            revelationType: "Meccan",
            numberOfAyahs: 7,
          },
          {
            number: 2,
            name: "البقرة",
            englishName: "Al-Baqara",
            englishNameTranslation: "The Cow",
            revelationType: "Medinan",
            numberOfAyahs: 286,
          },
        ],
      }),
    });
  });

  await page.route("**/api.hadith.gading.dev/books", async (route) => {
    const url = route.request().url();
    if (/\/books\/[^/]+/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            name: "Sahih Bukhari",
            id: "bukhari",
            available: 7000,
            requested: 10,
            hadiths: [
              { number: 1, arab: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", id: "Actions are judged by intentions." },
              { number: 2, arab: "الدِّينُ النَّصِيحَةُ", id: "Religion is sincere advice." },
            ],
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          { id: "bukhari", name: "Bukhari", available: 7000 },
          { id: "muslim", name: "Muslim", available: 5000 },
        ],
      }),
    });
  });

});

for (const route of routes) {
  test(`@a11y ${route} should pass axe checks`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test(`${route} visual regression snapshot`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Snapshots are tracked on Chromium baseline.");

    await page.goto(route);
    await page.waitForLoadState("networkidle");

    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0ms !important;
          transition-duration: 0ms !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot(
      `${route === "/" ? "home" : route.replace(/\//g, "-").slice(1)}.png`,
      {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      },
    );
  });
}
