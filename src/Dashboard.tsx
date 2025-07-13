import { AiOutlineCheck, AiOutlineClockCircle, AiOutlineClose } from 'solid-icons/ai';

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { onCleanup, onMount } from "solid-js";

const Dashboard = () => {
  // Example static data
  const filled = 3, due = 1, missed = 1, total = 5;

  onMount(() => {
    // Bar Chart
    let rootBar = am5.Root.new("barChartDiv");
    rootBar.setThemes([am5themes_Animated.new(rootBar)]);
    // Remove amCharts logo
    rootBar._logo?.dispose();
    let chart = rootBar.container.children.push(am5xy.XYChart.new(rootBar, {
      panX: false,
      panY: false,
      wheelX: "none",
      wheelY: "none"
    }));
    let xRenderer = am5xy.AxisRendererX.new(rootBar, { minGridDistance: 30 });
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(rootBar, {
      maxDeviation: 0.3,
      categoryField: "day",
      renderer: xRenderer
    }));
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(rootBar, {
      min: 0,
      max: 24,
      extraMax: 0.1,
      renderer: am5xy.AxisRendererY.new(rootBar, {})
    }));
    let series = chart.series.push(am5xy.ColumnSeries.new(rootBar, {
      name: "Attendance",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      categoryXField: "day",
      fill: am5.color(0xFFA500),
      stroke: am5.color(0xFFA500)
    }));
    series.columns.template.setAll({
      fill: am5.color(0xFFA500),
      stroke: am5.color(0xFFA500)
    });
    let data = [
      { day: "Sun", value: 1 },
      { day: "Mon", value: 15 },
      { day: "Tue", value: 6 },
      { day: "Wed", value: 12 },
      { day: "Thu", value: 22 },
      { day: "Fri", value: 8 },
      { day: "Sat", value: 2 }
    ];
    xAxis.data.setAll(data);
    series.data.setAll(data);

    // Pie Chart
    let rootPie = am5.Root.new("pieChartDiv");
    rootPie.setThemes([am5themes_Animated.new(rootPie)]);
    // Remove amCharts logo
    rootPie._logo?.dispose();
    
    let pieChart = rootPie.container.children.push(am5percent.PieChart.new(rootPie, {
      layout: rootPie.verticalLayout,
      paddingTop: 10,
      paddingBottom: 10
    }));
    
    let pieSeries = pieChart.series.push(am5percent.PieSeries.new(rootPie, {
      valueField: "value",
      categoryField: "category",
      alignLabels: false,  // Disable labels around the pie
      radius: am5.percent(90),  // Increase radius to use more space
      innerRadius: am5.percent(60)  // Make the donut hole larger
    }));
    
    // Set colors for the series
    pieSeries.get("colors")?.set("colors", [
      am5.color("#5470C6"),  // Dark blue
      am5.color("#FAC858"),  // Yellow
      am5.color("#EE6666")   // Red
    ]);
    
    // Set data
    pieSeries.data.setAll([
      { category: "Kelas Bahasa Indonesia", value: 34 },
      { category: "Magang Smarteleco", value: 23 },
      { category: "Mabar roblox", value: 27 }
    ]);
    
    // Configure labels to show only percentage in the center of each slice
    pieSeries.labels.template.setAll({
      text: "{valuePercentTotal.formatNumber('0.0')}%",
      textType: "adjusted",
      radius: 4,
      fill: am5.color(0x000000),
      fontSize: 12
    });
    
    // Hide the legend since we're using the custom one in JSX
    onCleanup(() => {
      rootBar.dispose();
      rootPie.dispose();
    });
  });

  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-black text-left">Overview</h1>
        
        {/* Background container for attendance cards */}
        <div class="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div class="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Filled attendance */}
            <div class="flex flex-col bg-green-50 rounded-xl p-6 shadow-sm">
              <div class="flex items-center gap-2 mb-2">
                <AiOutlineCheck size={22} class="text-green-600" />
                <span class="text-base font-medium text-black">Filled attendance</span>
              </div>
              <div class="flex items-end justify-between w-full">
                <span class="text-3xl font-bold text-black">{filled}/{total}</span>
                <span class="text-xs text-green-700 ml-2">today</span>
              </div>
            </div>
            
            {/* Due attendance */}
            <div class="flex flex-col bg-yellow-50 rounded-xl p-6 shadow-sm">
              <div class="flex items-center gap-2 mb-2">
                <AiOutlineClockCircle size={22} class="text-yellow-600" />
                <span class="text-base font-medium text-black">Due attendance</span>
              </div>
              <div class="flex items-end justify-between w-full">
                <span class="text-3xl font-bold text-black">{due}/{total}</span>
                <span class="text-xs text-yellow-700 ml-2">today</span>
              </div>
            </div>
            {/* Missed attendance */}
            <div class="flex flex-col bg-red-50 rounded-xl p-6 shadow-sm">
              <div class="flex items-center gap-2 mb-2">
                <AiOutlineClose size={22} class="text-red-600" />
                <span class="text-base font-medium text-black">Missed attendance</span>
              </div>
              <div class="flex items-end justify-between w-full">
                <span class="text-3xl font-bold text-black">{missed}/{total}</span>
                <span class="text-xs text-red-700 ml-2">last week</span>
              </div>
            </div>
          </div>
        </div>
        <h1 class="text-3xl font-bold mb-6 text-black text-left">Stats</h1>
        <div class="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Container */}
          <div class="bg-white rounded-xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)]">
            <h2 class="font-semibold text-lg mb-4 text-black text-center">Total attendance filled</h2>
            <div id="barChartDiv" class="w-full" style="height: 300px;"></div>
          </div>
          
          {/* Pie Chart Container */}
          <div class="bg-white rounded-xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)]">
            <h2 class="font-semibold text-lg mb-2 text-black text-center">Total attendance based on rooms</h2>
            <div class="flex flex-col lg:flex-row items-center justify-between h-full">
              <div id="pieChartDiv" class="flex-1" style="min-height: 250px; height: 100%; max-height: 300px;"></div>
              <div class="flex flex-col justify-center gap-4 p-4">
                <div class="flex items-center gap-2 text-sm text-black lg:text-base">
                  <span class="inline-block w-3 h-3 lg:w-4 lg:h-4 rounded" style="background: #5470C6"></span>
                  <span>Kelas Bahasa Indonesia</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-black lg:text-base">
                  <span class="inline-block w-3 h-3 lg:w-4 lg:h-4 rounded" style="background: #FAC858"></span>
                  <span>Magang Smarteleco</span>
                </div>
                <div class="flex items-center gap-2 text-sm text-black lg:text-base">
                  <span class="inline-block w-3 h-3 lg:w-4 lg:h-4 rounded" style="background: #EE6666"></span>
                  <span>Mabar roblox</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>
  );
};

export default Dashboard;
