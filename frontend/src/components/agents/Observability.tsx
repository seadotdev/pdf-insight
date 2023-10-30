import React, { type ChangeEvent, useEffect, useRef, useState, useCallback } from "react";

import { TimeSeries, Counter, Leaderboard } from "@propeldata/ui-kit";

export default function AgentPermissions() {


  return (
        <div className="mt-1 flex bg-gray-200 h-min w-full max-w-[1200px] flex-col items-center rounded-lg border-2 pb-4">
            <span className="font-extrabold">System Transactions</span>
            <div style={{ width: '65vw', height: '50vh' }}>
            <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
            <div className="overflow-hidden">
            

            <span className="font-extrabold"> Throughput</span>
            </div>
            {/* <Image src="/integrations.png" width={1800} height={800} className="mx-2 rounded-lg" alt="analytics" /> */}
            <TimeSeries
            labels={[
              "2022-01-01T00:00:00.000Z",
              "2022-02-01T00:00:00.000Z",
              "2022-03-01T00:00:00.000Z",
              "2022-04-01T00:00:00.000Z",
              "2022-05-01T00:00:00.000Z",
              "2022-06-01T00:00:00.000Z",
              "2022-07-01T00:00:00.000Z",
              "2022-08-01T00:00:00.000Z",
              "2022-09-01T00:00:00.000Z",
              "2022-10-01T00:00:00.000Z",
              "2022-11-01T00:00:00.000Z",
              "2022-12-01T00:00:00.000Z",
              "2023-01-01T00:00:00.000Z",
              "2023-02-01T00:00:00.000Z",
              "2023-03-01T00:00:00.000Z",
              "2023-04-01T00:00:00.000Z",
              "2023-05-01T00:00:00.000Z",
              "2023-06-01T00:00:00.000Z",
              "2023-07-01T00:00:00.000Z",
              "2023-08-01T00:00:00.000Z",
            ]}
            values={[
              809, 984, 673, 530, 522, 471, 872, 578, 825, 619, 328, 326, 328, 615,
              844, 58, 576, 228, 663, 189,
            ]}
            variant="line"
            />  
            <span className="font-extrabold">System Transactions</span>
            <TimeSeries
            labels={[
              "2022-01-01T00:00:00.000Z",
              "2022-02-01T00:00:00.000Z",
              "2022-03-01T00:00:00.000Z",
              "2022-04-01T00:00:00.000Z",
              "2022-05-01T00:00:00.000Z",
              "2022-06-01T00:00:00.000Z",
              "2022-07-01T00:00:00.000Z",
              "2022-08-01T00:00:00.000Z",
              "2022-09-01T00:00:00.000Z",
              "2022-10-01T00:00:00.000Z",
              "2022-11-01T00:00:00.000Z",
              "2022-12-01T00:00:00.000Z",
              "2023-01-01T00:00:00.000Z",
              "2023-02-01T00:00:00.000Z",
              "2023-03-01T00:00:00.000Z",
              "2023-04-01T00:00:00.000Z",
              "2023-05-01T00:00:00.000Z",
              "2023-06-01T00:00:00.000Z",
              "2023-07-01T00:00:00.000Z",
              "2023-08-01T00:00:00.000Z",
            ]}
            values={[
              809, 984, 673, 530, 522, 471, 872, 578, 825, 619, 38, 326, 128, 615,
              844, 58, 576, 28, 663, 189,
            ]}
            variant="bar"
            />  
            {/* <span className="font-extrabold">Transactions by Source</span>
                <Leaderboard
              headers={["DATA_SOURCE_TYPE", "value"]}
              rows={[
                ["Http", "7498734"],
                ["Snowflake", "6988344"],
                ["S3", "203245"],
                ["Redshift", "19594"],
              ]}
            /> */}
              {/* <span className="font-extrabold">Transaction % by LLM</span>
                <Leaderboard
              headers={["DATA_SOURCE_TYPE", "value"]}
              rows={[
                ["chatGPT4", "75"],
                ["chatGPT3.5 Turbo", "7"],
                ["Llama2", "12"],
                ["Llama", "1"],
              ]}
            /> */}

<span className="font-extrabold"> Uptime</span>
            {/* <Counter prefixValue=" %" value="99.8" localize /> */}
          </div>
        </div>
        </div>);
}

