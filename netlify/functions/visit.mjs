import { getStore } from "@netlify/blobs";

const STORE_NAME = "virixoo-analytics";

function getDateParts() {
  const now = new Date();

  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    month: `${year}-${month}`,
    year: `${year}`
  };
}

async function increment(store, key) {
  const current = await store.get(key, {
    type: "json",
    consistency: "strong"
  });

  const value =
    current && Number.isFinite(current.count)
      ? current.count
      : 0;

  const updated = {
    count: value + 1,
    updatedAt: new Date().toISOString()
  };

  await store.setJSON(key, updated);

  return updated.count;
}

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      {
        error: "Method Not Allowed"
      },
      {
        status: 405,
        headers: {
          Allow: "POST"
        }
      }
    );
  }

  try {
    const store = getStore(STORE_NAME);

    const { date, month, year } = getDateParts();

    const today = await increment(
      store,
      `visits/day/${date}`
    );

    const thisMonth = await increment(
      store,
      `visits/month/${month}`
    );

    const thisYear = await increment(
      store,
      `visits/year/${year}`
    );

    return Response.json({
      success: true,
      today,
      thisMonth,
      thisYear
    });

  } catch (error) {
    console.error("Analytics error:", error);

    return Response.json(
      {
        success: false,
        error: "Unable to record visit"
      },
      {
        status: 500
      }
    );
  }
};
