"use client";

import React, { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { FaArrowCircleUp } from "react-icons/fa";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [name, setName] = useState("");
  const [encodedSecret, setEncodedSecret] = useState("");
  const [selectedStockData, setSelectedStockData] = useState();
  const [shareholdingData, setShareholdingData] = useState([]);
  const [aboutText, setAboutText] = useState("");
  const [ratios, setRatios] = useState([]);
  const [pros, setPros] = useState([]);
  const [cons, setCons] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState(0);

  useEffect(() => {
    console.log("akshit", ratios);
  });

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
      setSelectedStockData(response.data.stockChartResponse.datasets[0].values);
      setRatios(response.data.ratios);
      setEncodedSecret(response.data.encodedSecret);
      setShareholdingData(response.data.shareholding);
      setPros(response.data.prosConsData.pros);
      setCons(response.data.prosConsData.cons);
      setAboutText(response.data.aboutText);
      setNews(response.data.newsDetails);
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    } catch (error) {
      // Log any errors that occur during the request
      console.error("Error:", error);
    }
  };

  const handleOptionClick = (selectedOption) => {
    console.log("Selected option:", selectedOption?.name);
    getChartData(selectedOption?.url);
    setName(selectedOption?.name);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (searchTerm !== "") {
        try {
          const response = await axios.post("http://localhost:6969/v1/search", {
            searchQuery: searchTerm,
          });

          setOptions(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      } else {
        setOptions([]);
      }
    };

    fetchData();
  }, [searchTerm]);

  const parseData = (data) => {
    return data?.map(([date, value]) => ({
      date,
      value: parseFloat(value), // convert value to a number
    }));
  };
  const chartData = parseData(selectedStockData);
  console.log(chartData, "chartData");

  return (
    <div className="flex justify-center w-full h-full bg-[#414141]">
      <div className="flex flex-col bg-[#414141] min-h-screen h-screen w-screen max-w-[1440px] p-2">
        <div
          id="header"
          className="w-full bg-[#282828] py-3 rounded-full text-white px-10 flex items-center justify-between"
        >
          <div className="font-extrabold text-[1.5vw]">STOKED</div>
          <div>(mid indices)</div>
          <div>(right buttons)</div>
        </div>
        <div
          id="search"
          className="flex items-center justify-center w-full py-5 text-white"
        >
          <Autocomplete
            options={options}
            getOptionLabel={(option) => option.name} // Replace 'label' with the key containing the display text
            style={{ width: "50%", color: "white" }}
            onChange={(event, value) => handleOptionClick(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search"
                variant="standard"
                sx={{ color: "white" }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          />
        </div>
        <div className="flex w-full h-full max-h-full text-white text-[13px]">
          <div
            id="proconsAndShare"
            className="flex flex-col items-center w-1/4 text-[14px] h-full p-2"
          >
            <div
              id="pros"
              className="w-full rounded-[30px] bg-gradient-to-br hover:overflow-y-scroll overflow-hidden from-[#0F6F13] to-[#021B03] px-8 py-5 h-1/5 hover:h-auto transition-all"
            >
              <span className="py-2 font-bold text-white">
                <mark>PROS</mark>
              </span>
              {pros?.map((pro, index) => (
                <div key={index} className="mt-1">
                  - {pro}
                  <br />
                </div>
              ))}
            </div>
            <div
              id="cons"
              className="w-full rounded-[30px] px-8 bg-gradient-to-br from-[#810A0A] to-[#170606] my-2 py-5 h-1/5 hover:h-auto hover:overflow-y-scroll overflow-hidden transition-all"
            >
              <span className="py-2 font-bold text-white">
                <mark>CONS</mark>
              </span>
              {cons?.map((con, index) => (
                <div key={index} className="mt-1">
                  - {con}
                  <br />
                </div>
              ))}
            </div>
            <div
              id="sharePieChart"
              className="w-full flex flex-col rounded-[30px] bg-[#141414] p-5 h-full hover:h-full transition-all overflow-hidden"
            >
              <span className="sticky top-0 text-center w-full py-2 font-bold text-[18px] bg-[#FFFF00] text-black px-4 rounded-full">
                SHAREHOLDING PATTERN
              </span>
            </div>
          </div>
          <div
            id="ratioAndChart"
            className="flex flex-col items-center w-1/2 h-full py-2"
          >
            <div
              id="ratios"
              className="flex items-center w-full bg-gradient-to-b mb-2 from-[#212121] to-[#3b3a3a] rounded-[30px] overflow-hidden pl-3 h-[30%]"
            >
              <div className="w-[10%] h-[90%] bg-black rounded-[30px] flex items-center justify-center">
                <MdOutlineCancel className="w-[40px] h-[40px]" />
              </div>
              <div className="w-[30%] h-full text-[20px] xl:font-[28px] justify-evenly font-bold p-2 px-4 flex flex-col">
                <span>{name}</span>
                <span>
                  ₹{" "}
                  {ratios.find((item) => item.name === "Current Price")?.value}
                </span>
                <span className="flex items-center w-full space-x-3 text-[16px] font-normal">
                  <FaArrowCircleUp fill="lightgreen" />
                  <span>0.14%</span>
                </span>
              </div>
              <div className="w-[60%] h-full bg-[#FFFF00] rounded-[30px] flex overflow-hidden text-black">
                <div className="flex flex-col w-1/3 h-full">
                  <div className="flex flex-col items-center justify-center w-full h-1/2">
                    <span className="text-[22px]">
                      ₹{" "}
                      {
                        ratios.find((item) => item.name === "Current Price")
                          ?.value
                      }
                    </span>
                    <span className="font-bold text-[10px]">Current Price</span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full h-1/2">
                    <span className="text-[22px]">
                      ₹{" "}
                      {ratios.find((item) => item.name === "Stock P/E")?.value}
                    </span>
                    <span className="font-bold text-[10px]">Stock P/E</span>
                  </div>
                </div>
                <div className="flex flex-col w-1/3 h-full">
                  <div className="flex flex-col items-center justify-center w-full h-1/2">
                    <span className="text-[130%]">
                      ₹{" "}
                      {ratios.find((item) => item.name === "Market Cap")?.value}{" "}
                      Cr
                    </span>
                    <span className="font-bold text-[10px]">Market Cap</span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full h-1/2">
                    <span className="text-[22px]">
                      {ratios.find((item) => item.name === "ROCE")?.value}%
                    </span>
                    <span className="font-bold text-[10px]">ROCE</span>
                  </div>
                </div>
                <div className="flex flex-col w-1/3 h-full">
                  <div className="flex flex-col items-center justify-center w-full h-1/2">
                    <span className="text-[22px]">
                      ₹{" "}
                      {ratios.find((item) => item.name === "Book Value")?.value}
                    </span>
                    <span className="font-bold text-[10px]">Book Value</span>
                  </div>
                  <div className="flex flex-col items-center justify-center w-full h-1/2">
                    <span className="text-[22px]">
                      {" "}
                      {ratios.find((item) => item.name === "ROE")?.value}%
                    </span>
                    <span className="font-bold text-[10px]">ROE</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="chart"
              className="w-full bg-[#141414] h-[70%] rounded-[30px] overflow-hidden flex flex-col"
            >
              <div className="w-full flex h-[15%] px-3 py-3 items-center justify-between">
                <div className="flex px-4 bg-gray-800 rounded-full">
                  <span className="px-3 py-3 rounded-full">1m</span>
                  <span className="px-3 py-3 rounded-full">6m</span>
                  <span className="px-3 py-3 rounded-full">1Yr</span>
                  <span className="px-3 py-3 rounded-full">3Yr</span>
                  <span className="px-3 py-3 rounded-full">5Yr</span>
                  <span className="px-3 py-3 rounded-full">Max</span>
                </div>
                <div className="flex px-8 py-3 space-x-6 bg-gray-800 rounded-full">
                  <span>Price</span>
                  <span>PE Ratio</span>
                </div>
              </div>
              <div className="flex items-center w-full h-full text-black">
                <ResponsiveContainer height={"80%"}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="4 4 4" fillOpacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.toLocaleString("en-US", {
                          month: "long",
                        })} ${date.getFullYear()}`;
                      }}
                    />
                    <YAxis color="#FFFF00" domain={["dataMin", "dataMax"]} />{" "}
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#FFFF00"
                      active
                      dot={false}
                      activeDot={true}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div id="aboutAndNews" className="flex flex-col w-1/4 h-full p-2">
            <div
              id="about"
              className="flex flex-col w-full rounded-[30px] bg-[#121212] p-3 h-1/2 max-h-1/2"
            >
              <span className="sticky top-0 text-center w-full py-2 font-bold text-[18px] bg-[#FFFF00] text-black px-4 rounded-full">
                ABOUT
              </span>
              <span className="text-[13px] w-full p-3 overflow-y-scroll overflow-hidden">
                {aboutText}
              </span>
            </div>
            <div
              id="news"
              className="mt-2 rounded-[30px] flex flex-col p-3 h-1/2 max-h-1/2 bg-[#121212] overflow-hidden"
            >
              <span className="p-2 font-bold text-[#FFFF00]">IN THE NEWS</span>
              <div className="flex flex-col overflow-y-scroll">
                {news?.map((newsItem) => (
                  <div
                    onClick={() => window.open(newsItem.linkToNews, "_blank")}
                    className="flex items-center justify-between w-full py-3 border-b cursor-pointer"
                  >
                    <span className="2/3 line-clamp-3">{newsItem.title}</span>
                    <img src={newsItem.imgSrc} className="w-1/3 " />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
