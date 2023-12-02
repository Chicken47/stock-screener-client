"use client";

import axios from "axios";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resultArr, setResultArr] = useState([]);
  const [stockArr, setStockArr] = useState([]);
  const [displayChart, setDisplayChart] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [ratios, setRatios] = useState("");
  const [shareholders, setShareholders] = useState("");
  const [quartersData, setQuartersData] = useState("");
  const [prosCons, setProsCons] = useState("");
  const [encodedSecret, setEncodedSecret] = useState("");
  const [timeSeries, setTimeSeries] = useState("");

  const handleSearchApiCall = async () => {
    const data = {
      searchQuery: searchQuery,
    };
    try {
      // Make the API request using Axios
      const response = await axios.post(
        "http://localhost:6969/v1/search",
        data
      );
      console.log("result", response.data);
      setResultArr(response.data);
      setDisplayChart(false);
    } catch (error) {
      // Log any errors that occur during the request
      console.error("Error:", error);
    }
  };

  const handleTimeSeries = async () => {
    const data = {
      timeSeries: timeSeries,
      encodedSecret: encodedSecret,
    };
    try {
      // Make the API request using Axios
      const response = await axios.post(
        "http://localhost:6969/v1/timeSeriesStockData",
        data
      );
      console.log("result", response.data);
      setStockArr(response.data.datasets[0].values);
      setDisplayChart(false);
    } catch (error) {
      // Log any errors that occur during the request
      console.error("Error:", error);
    }
  };

  // on clicking the link send it to resultArr.url
  const getChartData = async (url) => {
    const data = {
      url: url,
    };
    try {
      const response = await axios.post(
        "http://localhost:6969/v1/getStockData",
        data
      );
      console.log("stockData", response.data);
      setStockArr(response.data.stockChartResponse.datasets[0].values);
      setDisplayChart(true);
      setAboutText(response.data.aboutText);
      setEncodedSecret(response.data.encodedSecret);
      console.log("encodedSecret", response.data.encodedSecret);
      const shares = response.data.shareholding;
      setShareholders(JSON.stringify(shares));
      console.log("shares", shares);
      const ratios = response.data.ratios;
      setRatios(JSON.stringify(ratios));
      const quartersData = response.data.quartersData;
      setQuartersData(JSON.stringify(quartersData));
      const prosConsData = response.data.prosConsData;
      setProsCons(JSON.stringify(prosConsData));
      console.log("HWAT", stockArr);
      console.log("encodedSecret1", encodedSecret);
    } catch (error) {
      // Log any errors that occur during the request
      console.error("Error:", error);
    }
  };

  const parseData = (data) => {
    return data.map(([date, value]) => ({
      date,
      value: parseFloat(value), // convert value to a number
    }));
  };
  const chartData = parseData(stockArr);
  console.log("chartData", chartData, "stockArr", stockArr);

  return (
    <main className="flex flex-col items-center justify-center w-full min-h-screen py-20 space-y-20 text-white bg-slate-950">
      <div className="flex justify-center w-full space-x-5 transition-all">
        <input
          placeholder="Enter Stock's Name"
          className="w-4/5 px-3 py-3 text-black rounded"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={handleSearchApiCall}
          className="px-5 py-3 font-bold bg-green-700 rounded"
        >
          {displayChart ? "true" : "false"}
        </button>
      </div>
      {!displayChart && (
        <div className="flex flex-col w-full font-bold text-white transition-all rounded">
          {resultArr?.map((result) => (
            <span
              onClick={() => getChartData(result.url)} // Wrap getChartData in an anonymous function
              key={result.url} // Adding a unique key is recommended when using map
              className="py-2 text-center cursor-pointer hover:text-[20px] transition-all"
            >
              {result.name}
            </span>
          ))}
        </div>
      )}
      <div className="w-full bg-[#11223383] min-h-[100px] flex flex-col text-black">
        <span className="font-bold text-white">About Company</span>
        <span className="text-white">{aboutText}</span>
        <span className="mt-8 font-bold text-white">Ratios</span>
        <span className="text-white">{ratios}</span>
        <span className="mt-8 font-bold text-white">Shares</span>
        <span className="text-white">{shareholders}</span>
        <span className="mt-8 font-bold text-white">Quarterly Data</span>
        <span className="text-white">{quartersData}</span>
        <span className="mt-8 font-bold text-white">Pros and Cons Data</span>
        <span className="text-white">{prosCons}</span>
        <span className="mt-8 font-bold text-white">Set Time Series</span>
        <input
          type="number"
          value={timeSeries}
          onChange={(e) => setTimeSeries(e.target.value)}
          className="w-1/5"
        />
        <div
          className="w-1/12 p-5 my-3 bg-white cursor-pointer"
          onClick={handleTimeSeries}
        >
          Submit
        </div>
        <LineChart
          width={1200}
          height={400}
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {/* <XAxis dataKey="date" /> */}
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.toLocaleString("en-US", {
                month: "long",
              })} ${date.getFullYear()}`;
            }}
          />
          <YAxis domain={["dataMin", "dataMax"]} /> <Tooltip />
          <Legend />
          <Line
            type="linear"
            dataKey="value"
            stroke="#8884d8"
            active
            dot={false}
            activeDot={true}
            strokeWidth={2}
          />
        </LineChart>
      </div>
    </main>
  );
}
