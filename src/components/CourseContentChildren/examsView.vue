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
            <v-chip
              v-if="finishGetStatus"
              small
              :color="scoreColor(work.id)"
              text-color="white"
              class="mr-2"
            >
              {{ getScore(work.id) }}
            </v-chip>
            <v-chip
              v-if="!finishGetStatus"
              small
              color="grey lighten-1"
              text-color="white"
              class="mr-2"
            >
              <v-progress-circular
                :size="15"
                indeterminate
                color="primary"
              ></v-progress-circular>
            </v-chip>
            <span>|</span>
            <v-chip
              v-if="finishGetStatus"
              small
              class="ma-2"
              :color="statusColor(work.id)"
              text-color="white"
            >
              {{ status(work.id) }}
            </v-chip>
            <v-chip
              v-if="!finishGetStatus"
              small
              color="grey lighten-1"
              text-color="white"
              class="mr-2"
            >
              <v-progress-circular
                :size="15"
                indeterminate
                color="primary"
              ></v-progress-circular>
            </v-chip>
          </div>
        </v-card-title>
        <v-card-subtitle
          >截止时间 |
          {{ work.deadline == null ? " - " : work.deadline }}</v-card-subtitle
        >
      </v-card>
      <div style="height: 5px"></div>
    </div>

    <v-dialog width="550px" v-model="dialog_stuAnsStu">
      <!-- 答题卡 -->
      <stuAnsStu
        v-if="dialog_stuAnsStu"
        @closeSubmitCard="close($event)"
        :SUBMIT="submits"
        :qscores="qscores"
      />
    </v-dialog>

    <!-- 验证 -->
    <v-dialog
      v-if="dialog_preValidate"
      v-model="dialog_preValidate"
      width="750px"
    >
      <ExamsViewValidate
        @close="dialog_preValidate = false"
        v-if="dialog_preValidate"
        :work="work"
      />
    </v-dialog>

    <v-overlay v-if="loading">
      <v-progress-circular
        small
        indeterminate
        color="primary"
      ></v-progress-circular>
      <div class="mx-auto">{{ loadingText }}</div>
    </v-overlay>
    <v-snackbar
      v-model="snackbar"
      top
      color="error"
      dense="true"
      timeout="2000"
      rounded="pill"
    >
      {{ msg }}
    </v-snackbar>
  </v-container>
</template>

<script>
import stuAnsStu from "./stuAnsStu.vue";
import ExamsViewValidate from "./examsViewValidate.vue";
import { fun_getWorkStatus, fun_getWorkContent } from "@/api/work";
import { fun_getSubmitByWorkId } from "@/api/submit";
export default {
  components: { stuAnsStu, ExamsViewValidate },

  props: ["exams", "cid"],
  computed: {},
  methods: {
    close(val) {
      this.dialog_stuAnsStu = false;
    },
    enterPreValidate(work) {
      this.work = work;
      this.dialog_preValidate = true;
    },
    doWork(work) {
      let _this = this;
      if (this.status(work.id) == null || this.status(work.id) == undefined) {
        this.loading = false;
        return;
      } else {
        if (this.status(work.id) == "未提交") {
          if (work.status == -1) {
            this.$dialog({
              title: "时间已到",
              content: "已超过设定时间，无法作答",
              btns: [
                {
                  label: "好叭",
                  color: "red",
                  ghost: true,
                },
              ],
            });
            return;
          }
          //
          //
          //
          _this.enterPreValidate(work);
        } else if (
          this.status(work.id) == "批改中" ||
          this.status(work.id) == "已批改"
        ) {
          this.loading = true;
          this.loadingText = "获取答题卡中 ... ";
          fun_getWorkContent(work.id)
            .then((res) => {
              if (Number(res.code) < 0) {
                _this.loading = false;
                return;
              } else {
                let questions = res.data.questions;
                _this.qs = eval(questions);
                _this.qs.forEach((val, i) => {
                  _this.qscores[i] = val.qscore;
                });
                fun_getSubmitByWorkId(work.id)
                  .then((res) => {
                    _this.submits = JSON.parse(res.data);
                    _this.dialog_stuAnsStu = true;
                    _this.loading = false;
                  })
                  .catch((err) => {
                    // TODO
                    console.log(err);
                    _this.loading = false;
                  });
              }
            })
            .catch((err) => {
              console.log(err);

              _this.loading = false;
            });
        }
      }
    },
    status(wid) {
      let ret = "";
      this.finish_status.forEach((val, i) => {
        if (val.wid == wid) {
          ret = val.status;
          if (val.status == -1) {
            ret = "未提交";
          } else if (val.status == 0) {
            ret = "批改中";
          } else if (val.status == 1) {
            ret = "已批改";
          }
        }
      });
      return ret;
    },
    statusColor(wid) {
      let ret = "";
      this.finish_status.forEach((val, i) => {
        if (val.wid == wid) {
          ret = val.status;
          if (val.status == -1) {
            ret = "error";
          } else if (val.status == 0) {
            ret = "warning";
          } else if (val.status == 1) {
            ret = "success";
          }
        }
      });
      return ret;
    },
    scoreColor(wid) {
      let ret = "";
      this.finish_status.forEach((val, i) => {
        if (val.wid == wid) {
          ret = val.status;
          if (ret == -1 || ret == 0) {
            ret = "grey";
          } else {
            if (Number(val.score) < 60) {
              ret = "error";
            } else if (Number(val.score) <= 80) {
              ret = "warning";
            } else if (Number(val.score) <= 100) {
              ret = "success";
            }
          }
        }
      });
      return ret;
    },
    getScore(wid) {
      let ret = "";
      this.finish_status.forEach((val, i) => {
        if (val.wid == wid) {
          if (val.status == -1) {
            ret = "-";
          } else if (val.status == 0) {
            ret = "-";
          } else if (val.status == 1) {
            ret = val.score;
          }
        }
      });
      return Number(ret).toFixed(1);
    },
    async getWorkStatus() {
      //
      // [{wid:, status: ,score:}]
      //
      let _this = this;
      fun_getWorkStatus(this.cid).then((res) => {
        let arr = eval(res.data);
        arr.forEach((val, i) => {
          _this.finish_status[i] = val;
        });
        _this.finish_status;
        _this.finishGetStatus = true;
      });
    },
  },
  data() {
    return {
      finish_status: [],
      finishGetStatus: false,
      msg: "",
      snackbar: "",
      dialog_stuAnsStu: false,
      dialog_preValidate: false,
      tabs_validate: 0,
      qs: [],
      qscores: [],
      submits: [],
      work: {},
      loading: false,
      loadingText: "",
    };
  },
  mounted() {
    this.getWorkStatus();
  },
  created() {},
};
</script>

<style scoped></style>
