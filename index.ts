import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

const prisma = new PrismaClient();

const app = new Hono();

app.use(logger());

const checkShortUrl = async (shortUrl: string) => {
  const url = await prisma.url.findUnique({
    where: { shortUrl },
    select: { id: true },
  });

  return !!url;
};

async function main() {
  app.get("/", (c) => {
    return c.json({ message: "Hello World" });
  });

  app.get("/:shortUrl", async (c) => {
    try {
      const { shortUrl } = c.req.param();
      const { cli } = c.req.query();

      if (cli === "true") {
        const url = await prisma.url.findUnique({
          where: { shortUrl },
          select: { url: true },
        });

        if (!url) {
          return c.json({ message: "Not Found" }, 404);
        }

        return c.json({ url: url.url });
      }

      const url = await prisma.url.findUnique({
        where: { shortUrl },
        select: { url: true },
      });

      if (!url) {
        return c.json({ message: "Not Found" }, 404);
      }

      await prisma.url.update({
        where: { shortUrl },
        data: { clicks: { increment: 1 } },
      });

      return c.redirect(url.url);
    } catch (e) {
      console.error(e);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });

  app.post("/", async (c) => {
    try {
      const { url: queryUrl } = c.req.query();
      const { url: bodyUrl } = await c.req.json();

      const url = queryUrl || bodyUrl;

      if (!url) {
        return c.json({ message: "Bad Request" }, 400);
      }

      let shortUrl = "";
      const maxAttempts = 10;

      for (let count = 0; count < maxAttempts; count++) {
        shortUrl = Math.random().toString(36).slice(-6);
        if (!(await checkShortUrl(shortUrl))) {
          break;
        }
        if (count === maxAttempts - 1) {
          return c.json(
            { message: "Could not generate unique short URL" },
            500
          );
        }
      }

      await prisma.url.create({
        data: {
          url,
          shortUrl,
        },
      });

      return c.json({
        shortUrl: `${
          process.env.NODE_ENV === "production"
            ? "https://shortyurl.up.railway.app"
            : "http://localhost:3000"
        }/${shortUrl}`,
      });
    } catch (e) {
      console.error(e);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });
}

main()
  .then(() => {
    console.log("Server is ready");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

const port = parseInt(process.env.PORT || "3000", 10);
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
