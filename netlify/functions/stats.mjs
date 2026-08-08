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

async function getCount(store, key) {
  const data = await store.get(key, {
    type: "json",
    consistency: "strong"
  });

  if (!data || typeof data.count !== "number") {
    return 0;
  }

  return data.count;
}

export default async (request) => {
  if (request.method !== "GET") {
    return Response.json(
      {
        error: "Method Not Allowed"
      },
      {
        status: 405,
        headers: {
          Allow: "GET"
        }
      }
    );
  }

  try {
    const store = getStore(STORE_NAME);
    const { date, month, year } = getDateParts();

    const today = await getCount(
      store,
      `visits/day/${date}`
    );

    const thisMonth = await getCount(
      store,
      `visits/month/${month}`
    );

    const thisYear = await getCount(
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
    console.error("Stats error:", error);

    return Response.json(
      {
        success: false,
        today: 0,
        thisMonth: 0,
        thisYear: 0
      },
      {
        status: 500
      }
    );
  }
};
