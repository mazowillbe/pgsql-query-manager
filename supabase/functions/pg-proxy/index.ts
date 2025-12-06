import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

// Polyfill for BigInt serialization
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const { connectionString, query, params, action } = await req.json();

    if (!connectionString) {
      throw new Error("Missing connectionString");
    }

    const client = new Client(connectionString);
    await client.connect();

    let result;

    if (action === 'test') {
      // Just testing connection
      result = { success: true, message: "Connected successfully" };
    } else {
       // Execute Query
      if (!query) throw new Error("Missing query");
      
      const queryResult = await client.queryObject(query, params || []);
      // Map to a more friendly format if needed, but queryObject returns rows directly
      
      let columns: string[] = [];
      if (queryResult.rows.length > 0) {
        columns = Object.keys(queryResult.rows[0]);
      }

      result = {
        rows: queryResult.rows,
        columns: columns,
        rowCount: queryResult.rowCount
      };
    }

    await client.end();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, // Client error mostly (bad query, bad connection string)
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});