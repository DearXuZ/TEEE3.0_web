<template>
  <div id="charts_work" style="width: 100%; height: 250px"></div>
</template>

<script>
import * as echarts from "echarts";
// var myChart;
// window.onresize = function () {
//   myChart.resize();
// };

export default {
  props: ["data"],
  computed: {
    data_name() {
      let arr = eval(this.data);
      let ret = [];
      arr.forEach((element, i) => {
        ret[i] = element.WorkName;
      });

      return ret;
    },
    data_value() {
      let arr = eval(this.data);
      let ret = [];
      arr.forEach((element, i) => {
        ret[i] = element.score;
      });
      return ret;
    },
  },
  mounted() {
    this.initData();
    this.initChart();
  },
  data() {
    return {};
  },
  methods: {
    initData() {
      //   let arr = eval(this.data);
      //   let ret = [];
      //   arr.forEach((element, i) => {
      //     this.data_name[i] = element.WorkName;
      //   });
    },
    initChart() {
      let _this = this;
      myChart = echarts.init(document.getElementById("charts_work"));
      //   window.onresize = function () {
      //     myChart.resize();
      //   };
      var options = {
        title: {
          text: "作业平均分数",
        },
        yAxis: {
          type: "value",
        },
        xAxis: {
          type: "category",
          data: _this.data_name,
          axisLabel: {
            showMaxLabel: true,
            interval: 0,
            rotate: 20,
          },
          //   data: ["1", "2", "3", "4"],
        },
        series: [
          {
            type: "line",
            data: _this.data_value,
            smooth: true,
            label: {
              show: true,
              position: "top",
            },
          },
        ],
      };
      // 绘制图表
      myChart.setOption(options);
    },
  },
};
</script>

<style scoped></style>
