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
import mixpanel from "mixpanel-browser";

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [name, setName] = useState("");
  const [encodedSecret, setEncodedSecret] = useState("");
  const [selectedStockData, setSelectedStockData] = useState();
  const [shareholdingData, setShareholdingData] = useState([]);
  const [peData, setPeData] = useState([]);
  const [aboutText, setAboutText] = useState("");
  const [ratios, setRatios] = useState([]);
  const [pros, setPros] = useState([]);
  const [cons, setCons] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeSeries, setTimeSeries] = useState("1yr");
  const [chartType, setChartType] = useState("price");

  const unselected =
    "px-[5px] md:px-3 py-[5px] md:py-3 text-[10px] md:text-[13px] transition-all rounded-full cursor-pointer hover:font-bold";
  const selected =
    "px-[5px] md:px-3 py-[5px] md:py-3 text-[10px] md:text-[13px] bg-[#FFFF00] text-black cursor-pointer hover:font-bold transition-all rounded-full";

  mixpanel.init("dcc97e50489f64a322bcd4ab4cf2e74c", { debug: true });
  useEffect(() => {
    mixpanel.track("Stoked");
  }, []);

  const numberOfDays = (time) => {
    switch (time) {
      case "1m":
        return 30;
      case "6m":
        return 6 * 30;
      case "1yr":
        return 365;
      case "3yr":
        return 3 * 365;
      case "5yr":
        return 5 * 365;
      case "max":
        return 10000;
      default:
        return 0;
    }
  };

  const handleTimeSeries = async () => {
    const timeInDays = numberOfDays(timeSeries);

    const data = {
      timeSeries: timeInDays,
      encodedSecret: encodedSecret,
    };
    try {
      const response = await axios.post(
        "https://stock-screener-server.onrender.com/v1/timeSeriesStockData",
        data
      );
      console.log("result", response.data);
      setSelectedStockData(response.data.datasets[0].values);
    } catch (error) {
      // Log any errors that occur during the request
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    handleTimeSeries();
    fetchPeData();
  }, [timeSeries]);

  const getChartData = async (url) => {
    setLoading(true);
    const data = {
      url: url,
    };
    try {
      const response = await axios.post(
        "https://stock-screener-server.onrender.com/v1/getStockData",
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
      setTimeSeries("1yr");
      setLoading(false);
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    } catch (error) {
      setLoading(false);
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
          const response = await axios.post(
            "https://stock-screener-server.onrender.com/v1/search",
            {
              searchQuery: searchTerm,
            }
          );

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

  const fetchPeData = async () => {
    const timeInDays = numberOfDays(timeSeries);
    try {
      const response = await axios.post(
        "https://stock-screener-server.onrender.com/v1/timeSeriesPriceToEarningData",
        {
          timeSeries: timeInDays,
          encodedSecret: encodedSecret,
        }
      );
      setPeData(response.data.datasets[1].values);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const parseData = (data) => {
    return data?.map(([date, value]) => ({
      date,
      value: parseFloat(value),
    }));
  };
  const chartData = parseData(selectedStockData);
  const peChartData = parseData(peData);

  function getColorBasedOnIndex(index) {
    const colors = ["#82ca9d", "#8884d8", "#ffc658", "#ff7300", "#e44d25"];
    return colors[index % colors.length];
  }

  const pieChartData = shareholdingData.map((item, index) => {
    const lastDate = Object.keys(item).pop();
    const color = getColorBasedOnIndex(index);
    return {
      name: item.category,
      value: parseFloat(item[lastDate].replace("%", "")),
      color: color,
    };
  });
  console.log(pieChartData, "chartData");

  return (
    <div className="flex justify-center w-full h-full bg-[#414141]">
      <div className="flex flex-col bg-[#414141] min-h-screen h-screen w-screen max-w-[1440px] p-2">
        <div
          id="header"
          className="w-full bg-[#282828] py-3 rounded-full text-white px-10 flex items-center justify-between"
        >
          <div className="font-extrabold w-full text-center text-[20px]">
            STOKED
          </div>
          {/* <div>(mid indices)</div>
          <div>(right buttons)</div> */}
        </div>
        <div
          id="search"
          className="flex items-center justify-center w-full py-5 text-white"
        >
          <Autocomplete
            options={options}
            className="w-11/12 font-bold text-white md:w-1/2"
            getOptionLabel={(option) => option.name}
            // style={{ width: "50%", color: "white" }}
            // sx={{ width: "50%", color: "white" }}
            onChange={(event, value) => handleOptionClick(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search"
                variant="standard"
                // InputProps={{
                //   sx: { color: "white" },
                //   className: "text-white",
                // }}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center w-full h-full">
            <img
              src="https://media.giphy.com/media/L05HgB2h6qICDs5Sms/giphy.gif"
              className="w-1/2 md:w-1/5"
              alt="Loading"
            />
          </div>
        ) : chartData ? (
          <div className="flex flex-col md:flex-row w-full h-full max-h-full text-white text-[13px]">
            <div
              id="proconsAndShare"
              className="hidden md:flex flex-col items-center md:w-1/4 text-[14px] h-full p-2"
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
                className="w-full flex flex-col rounded-[30px] bg-[#141414] p-5 h-3/5 hover:h-full transition-all overflow-hidden"
              >
                <span className="sticky top-0 text-center w-full py-2 font-bold text-[18px] bg-[#FFFF00] text-black px-4 rounded-full">
                  SHAREHOLDING DATA
                </span>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey={"value"}
                      name="name"
                      cx="50%"
                      cy="50%"
                      // innerRadius={60}
                      outerRadius={80}
                      fill="#82ca9d"
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={100} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div
              id="ratioAndChart"
              className="flex flex-col items-center h-full px-2 py-2 md:px-0 md:w-1/2"
            >
              <div
                id="ratios"
                className="flex justify-between items-center w-full bg-gradient-to-b mb-2 from-[#212121] to-[#3b3a3a] rounded-[30px] overflow-hidden md:pl-3 md:h-[30%]"
              >
                <div
                  // onClick={() => setC}
                  className="w-[10%] h-[90%] bg-black rounded-[30px] hidden md:flex items-center justify-center"
                >
                  <MdOutlineCancel className="w-[40px] h-[40px]" />
                </div>
                <div className="w-[30%] h-full md:text-[20px] xl:font-[28px] justify-evenly font-bold p-10 md:p-5 px-4 flex flex-col">
                  <span>{name}</span>
                  <span>
                    ₹{" "}
                    {
                      ratios.find((item) => item.name === "Current Price")
                        ?.value
                    }
                  </span>
                  <span className="flex items-center w-full space-x-3 text-[16px] font-normal">
                    <FaArrowCircleUp fill="lightgreen" />
                    <span>0.14%</span>
                  </span>
                </div>
                <div className="w-[60%] h-full bg-[#FFFF00] rounded-[30px] flex overflow-hidden text-black">
                  <div className="flex flex-col w-1/3 h-full">
                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                      <span className="md:text-[22px]">
                        ₹{" "}
                        {
                          ratios.find((item) => item.name === "Current Price")
                            ?.value
                        }
                      </span>
                      <span className="font-bold text-[10px]">
                        Current Price
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                      <span className="md:text-[22px]">
                        ₹{" "}
                        {
                          ratios.find((item) => item.name === "Stock P/E")
                            ?.value
                        }
                      </span>
                      <span className="font-bold text-[10px]">Stock P/E</span>
                    </div>
                  </div>
                  <div className="flex flex-col w-1/3 h-full">
                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                      <span className="md:text-[130%] text-[10px]">
                        ₹{" "}
                        {
                          ratios.find((item) => item.name === "Market Cap")
                            ?.value
                        }{" "}
                        Cr
                      </span>
                      <span className="font-bold text-[10px]">Market Cap</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                      <span className="md:text-[22px]">
                        {ratios.find((item) => item.name === "ROCE")?.value}%
                      </span>
                      <span className="font-bold text-[10px]">ROCE</span>
                    </div>
                  </div>
                  <div className="flex flex-col w-1/3 h-full">
                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                      <span className="md:text-[22px]">
                        ₹{" "}
                        {
                          ratios.find((item) => item.name === "Book Value")
                            ?.value
                        }
                      </span>
                      <span className="font-bold text-[10px]">Book Value</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                      <span className="md:text-[22px]">
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
                  <div className="flex px-2 bg-gray-800 rounded-full md:px-4">
                    <span
                      onClick={() => setTimeSeries("1m")}
                      className={timeSeries === "1m" ? selected : unselected}
                    >
                      1m
                    </span>
                    <span
                      onClick={() => setTimeSeries("6m")}
                      className={timeSeries === "6m" ? selected : unselected}
                    >
                      6m
                    </span>
                    <span
                      onClick={() => setTimeSeries("1yr")}
                      className={timeSeries === "1yr" ? selected : unselected}
                    >
                      1Yr
                    </span>
                    <span
                      onClick={() => setTimeSeries("3yr")}
                      className={timeSeries === "3yr" ? selected : unselected}
                    >
                      3Yr
                    </span>
                    <span
                      onClick={() => setTimeSeries("5yr")}
                      className={timeSeries === "5yr" ? selected : unselected}
                    >
                      5Yr
                    </span>
                    <span
                      onClick={() => setTimeSeries("max")}
                      className={timeSeries === "max" ? selected : unselected}
                    >
                      Max
                    </span>
                  </div>
                  <div className="flex px-2 bg-gray-800 rounded-full md:px-4">
                    <span
                      className={chartType === "price" ? selected : unselected}
                      onClick={() => setChartType("price")}
                    >
                      Price
                    </span>
                    <span
                      className={chartType === "pe" ? selected : unselected}
                      onClick={() => {
                        fetchPeData();
                        setChartType("pe");
                      }}
                    >
                      PE Ratio
                    </span>
                  </div>
                </div>
                <div className="flex items-center w-full h-full text-black">
                  <ResponsiveContainer height={"80%"}>
                    <LineChart
                      data={chartType === "price" ? chartData : peChartData}
                      margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4 4"
                        fillOpacity={0.2}
                        color="#121212"
                      />
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
                      <Tooltip
                        active
                        contentStyle={{ backgroundColor: "#3A3939" }}
                      />
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
            <div
              id="aboutAndNews"
              className="flex flex-col h-full p-2 md:w-1/4"
            >
              <div
                id="about"
                className="flex flex-col w-full rounded-[30px] bg-[#121212] p-3 md:h-1/2 md:max-h-1/2"
              >
                <span className="sticky top-0 text-center w-full py-2 font-bold text-[18px] bg-[#FFFF00] text-black px-4 rounded-full">
                  ABOUT
                </span>
                <span className="text-[13px] w-full p-3 hover:overflow-y-scroll overflow-hidden">
                  {aboutText}
                </span>
              </div>
              <div
                id="news"
                className="mt-2 rounded-[30px] flex flex-col p-3 h-1/2 max-h-1/2 bg-[#121212] overflow-hidden"
              >
                <span className="p-2 font-bold text-[#FFFF00]">
                  IN THE NEWS
                </span>
                <div className="flex flex-col overflow-hidden hover:overflow-y-scroll">
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
            <div
              id="proconsAndShare"
              className="md:hidden flex flex-col items-center md:w-1/4 text-[14px] min-h-full p-2"
            >
              <div
                id="pros"
                className="w-full rounded-[30px] bg-gradient-to-br  from-[#0F6F13] to-[#021B03] px-8 py-5 h-auto transition-all"
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
                className="w-full rounded-[30px] px-8 bg-gradient-to-br from-[#810A0A] to-[#170606] my-2 py-5 h-auto transition-all"
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
                className="w-full flex flex-col rounded-[30px] bg-[#141414] p-5 transition-all"
              >
                <span className="sticky top-0 text-center w-full py-2 font-bold text-[18px] bg-[#FFFF00] text-black px-4 rounded-full">
                  SHAREHOLDING DATA
                </span>
                <div className="h-[400px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        dataKey={"value"}
                        name="name"
                        cx="50%"
                        cy="50%"
                        // innerRadius={60}
                        outerRadius={80}
                        fill="#82ca9d"
                        label
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={100} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Page;
