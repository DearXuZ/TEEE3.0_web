<template>
  <v-container>
    <div v-for="work in exams" v-bind:key="work.id">
      <v-card style="min-width: 100%" hover ripple="" @click="doWork(work)">
        <v-card-title>
          <v-chip
            :color="work.status == -1 ? 'grey' : '#b97a57'"
            label
            small
            class="mr-2"
            dark
          >
            {{ work.status == -1 ? "已截止" : "进行中" }}
          </v-chip>
          {{ work.wname }}
          <v-spacer></v-spacer>
          <div v-show="$vuetify.breakpoint.lgAndUp">
            <v-tooltip top v-if="work.subNum - work.rDone > 0">
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  v-on="on"
                  v-bind="attrs"
                  small
                  class="ma-2"
                  color="transparent"
                  text-color="white"
                >
                  <v-icon color="warning" small>fa fa-bell</v-icon>
                </v-chip>
              </template>
              <span>有未批改的考试</span>
            </v-tooltip>

            <v-tooltip v-if="loading_subNum" top>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  v-on="on"
                  v-bind="attrs"
                  small
                  class="ma-2"
                  color="grey"
                  outlined
                >
                  {{ work.subNum }} / {{ submit_totalNum }}</v-chip
                >
              </template>
              <span>已提交 / 班级人数</span>
            </v-tooltip>
            <v-chip
              small
              class="ma-2"
              color="grey"
              text-color="white"
              v-if="!loading_subNum"
            >
              <v-container>
                <v-row class="text-center">
                  <v-col cols="12">
                    <v-progress-circular
                      indeterminate
                      :size="20"
                      color="primary"
                    ></v-progress-circular>
                  </v-col>
                </v-row>
              </v-container>
            </v-chip>
            <!-- TODO Delete可以放在edit里面 -->
            <!-- <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-chip
                  small
                  class="ma-2"
                  color="error"
                  text-color="white"
                  @click="deleteWork(work)"
                  hover
                  v-on="on"
                  v-bind="attrs"
                >
                  <v-icon x-small class="pr-2">fa fa-ellipsis-v</v-icon>
                </v-chip>
              </template>
              <span>删除该作业</span>
            </v-tooltip> -->
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  class="ma-2"
                  v-on="on"
                  v-bind="attrs"
                  @click="editWork(work)"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <span>编辑</span>
            </v-tooltip>
          </div>
        </v-card-title>
        <v-card-subtitle
          >截止时间 |
          {{
            work.deadline == undefined ? " - " : work.deadline
          }}</v-card-subtitle
        >
      </v-card>
      <div style="height: 5px"></div>
    </div>
    <v-snackbar
      v-model="snackbar"
      style="margin-top: 64px"
      top
      right
      color="primary"
      dense="true"
      timeout="1000"
      rounded="pill"
    >
      {{ msg }}
    </v-snackbar>
  </v-container>
</template>

<script>
import { fun_getSummary, fun_delWork } from "@/api/work";
export default {
  props: ["exams", "cid"],
  computed: {},
  data() {
    return {
      loading_subNum: false,
      submit_totalNum: -1,
      isDelete: false,
      snackbar: false,
      msg: "",
    };
  },
  methods: {
    doWork(work) {
      let cid = this.cid;
      if (this.isDelete == false) {
        this.$router.push({
          name: "WorkContent",
          params: { wid: work.id, wname: work.wname, cid: cid },
        });
      } else {
        this.isDelete = false;
      }
    },
    getSubStatus() {
      let _this = this;
      fun_getSummary(this.cid).then((res) => {
        let data = res.data;
        let arr = eval(data.works);
        _this.submit_totalNum = data.submit_totalNum;
        arr.forEach((item) => {
          _this.exams.forEach((w, i) => {
            if (item.wid == w.id) {
              w.subNum = item.subNum;
              w.rDone = item.rDone;
            }
          });
        });
        _this.loading_subNum = true;
      });
    },
    deleteWork(work) {
      let _this = this;

      this.isDelete = true;
      this.$dialog({
        title: "删除作业",
        content: "确定要删除该作业嘛？ 删除后无法直接恢复哦",
        btns: [
          {
            label: "确定",
            color: "#be8464",
            callback: () => {
              fun_delWork(work.id)
                .then((res) => {
                  _this._alert(res.msg);
                  _this.$emit("flush", true);
                })
                .catch(() => {
                  _this.$emit("flush", true);
                });
            },
          },
          {
            label: "算了",
            color: "grey",
            ghost: true,
          },
        ],
      });
      return;
    },
  },
  created() {},
  mounted() {
    this.loading_SubStatus = false;
    this.getSubStatus();
  },
};
</script>

<style scoped></style>
