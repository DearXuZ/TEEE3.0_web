<template>
  <div class="px-4">
    <div style="height: 25px"></div>
    <v-container fluid>
      <v-dialog persistent v-model="releaseWorkDialog" width="800px">
        <release-work :cid="cid" @close="close($event)" />
      </v-dialog>
      <v-dialog
        content-class="trans"
        persistent
        v-model="releaseAnnDialog"
        width="800px"
      >
        <Announcement_release @close="close($event)" />
      </v-dialog>
      <v-dialog
        v-if="shareCourseDialog"
        v-model="shareCourseDialog"
        persistent
        width="500px"
      >
        <create-key-dialog
          action="0"
          :param="cid"
          @close="closeShareCourseDialog($event)"
        />
      </v-dialog>
      <v-row>
        <!-- Course WorkPlace -->
        <v-col cols="12" lg="8">
          <v-card>
            <v-sheet class="py-6 px-10 transparent">
              <v-row v-if="isTeacher">
                <v-col cols="12">
                  <v-chip @click="releaseWorkDialog = true" color="primary">
                    <v-icon color="white" small left>mdi-send</v-icon>
                    <span style="color: white">发布新作业 / 考试</span>
                  </v-chip>

                  <v-chip
                    @click="releaseAnnDialog = true"
                    color="primary"
                    class="ml-3"
                  >
                    <v-icon color="white" small left>mdi-bullhorn</v-icon>
                    <span style="color: white">发布公告</span>
                  </v-chip>
                  <v-chip
                    @click="shareCourseDialog = true"
                    color="primary"
                    class="ml-3"
                  >
                    <v-icon color="white" small left>mdi-share</v-icon>
                    <span style="color: white">生成课程邀请码</span>
                  </v-chip>
                  <v-chip
                    @click="
                      flushContent();
                      getCourseInfo();
                      getCourseStatsitics();
                    "
                    color="black"
                    class="ml-3"
                    outlined
                    v-show="
                      finishGetUser && loading_workview && loading_examview
                    "
                  >
                    <v-icon small left>mdi-refresh</v-icon>
                    <span>刷新</span>
                  </v-chip>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-sheet>
                    <v-tabs
                      v-model="tab"
                      background-color="transparent"
                      color="#b97a57"
                      :centered="!$vuetify.breakpoint.lgAndUp"
                    >
                      <v-tab v-for="item in items" :key="item">
                        {{ item }}
                      </v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab">
                      <v-tab-item :key="items[0]" :loading="!loading_workview">
                        <v-card color="basil" flat class="pt-5">
                          <WorksView
                            :cid="cid"
                            :works="works"
                            v-if="loading_workview && !isTeacher"
                          />
                          <WorksViewTeacher
                            :cid="cid"
                            :works="works"
                            @flush="flushContent"
                            v-if="loading_workview && isTeacher"
                          />
                          <v-row>
                            <v-col>
                              <div class="text-center">
                                <v-pagination
                                  @input="getWorks(pageOfWorks)"
                                  v-model="pageOfWorks"
                                  :length="page_lenOfWorks"
                                ></v-pagination>
                              </div>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-tab-item>
                      <!-- 考试模块 -->
                      <v-tab-item :loading="!loading_examview">
                        <v-card color="basil" flat class="pt-5">
                          <ExamsView
                            :cid="cid"
                            :exams="exams"
                            v-if="loading_examview && !isTeacher"
                          />
                          <ExamsViewTeacher
                            :cid="cid"
                            :exams="exams"
                            @flush="flushContent"
                            v-if="loading_examview && isTeacher"
                          />

                          <v-row>
                            <v-col>
                              <div class="text-center">
                                <v-pagination
                                  @input="getExams(pageOfExams)"
                                  v-model="pageOfExams"
                                  :length="page_lenOfExams"
                                ></v-pagination>
                              </div>
                            </v-col>
                          </v-row>
                        </v-card>
                      </v-tab-item>
                      <!-- 公告模块 -->
                      <v-tab-item class="pt-5">
                        <v-card color="basil" flat>
                          <Announcement
                            :announcement="announcement"
                            v-if="loading_announcementview"
                          />
                        </v-card>
                      </v-tab-item>
                      <!-- 成员管理模块 -->
                      <v-tab-item v-if="isTeacher">
                        <v-card>
                          <v-card-title>
                            学生列表
                            <v-spacer></v-spacer>
                            <v-text-field
                              v-model="search_user"
                              append-icon="mdi-magnify"
                              label="Search"
                              single-line
                              hide-details
                            ></v-text-field>
                          </v-card-title>
                          <v-data-table
                            :loading="!finishGetUser"
                            loading-text="正在努力加载课程学生信息 ..."
                            :headers="usertable_headers"
                            :items="userinfos"
                            :search="search_user"
                            :items-per-page="10"
                            :page.sync="pageOfUser"
                            @page-count="pageCount = $event"
                            hide-default-footer
                          >
                            <template v-slot:item.username="{ item }">
                              <v-chip outlined>
                                <v-avatar left size="30">
                                  <v-img :src="item.avatar"></v-img>
                                </v-avatar>
                                {{ item.username }}</v-chip
                              >
                            </template>
                            <template v-slot:item.delete="{ item }">
                              <v-chip small @click="removeStu(item.uid)">
                                <v-avatar left>
                                  <v-icon small> mdi-exit-to-app </v-icon>
                                </v-avatar>
                                Delete
                              </v-chip>
                            </template>
                          </v-data-table>
                          <div class="text-center pt-2">
                            <v-pagination
                              v-model="pageOfUser"
                              :length="pageCount"
                            ></v-pagination>
                          </div>
                        </v-card>
                      </v-tab-item>
                    </v-tabs-items>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-sheet>
          </v-card>
        </v-col>
        <!-- Course Info -->
        <v-col cols="12" lg="4">
          <v-card>
            <v-sheet class="py-6 px-10 transparent">
              <!-- 课程信息 -->
              <v-card outlined :loading="!finishGetCourseInfo" class="mt-5">
                <v-card-title class="brown--text text-h4">{{
                  CourseInfo.cname
                }}</v-card-title>
                <v-card-subtitle class="text-overline"
                  >{{ CourseInfo.startTime }} -
                  {{ CourseInfo.endTime }}</v-card-subtitle
                >
                <v-divider class="mb-5"></v-divider>
                <v-container v-if="finishGetCourseInfo">
                  <v-row>
                    <v-col cols="12" lg="5" class="text-overline">
                      <span>任课教师：{{ CourseInfo.tname }}</span>
                      <v-divider></v-divider>

                      <span>班级人数: {{ CourseInfo.UserCount }}</span>
                      <v-divider></v-divider>

                      <span
                        >作业次数:
                        {{
                          CourseInfo.WorksCount == null
                            ? 0
                            : CourseInfo.WorksCount
                        }}</span
                      >
                      <v-divider></v-divider>
                      <span
                        >考试次数:
                        {{
                          CourseInfo.ExamsCount == null
                            ? 0
                            : CourseInfo.ExamsCount
                        }}</span
                      >
                      <v-divider></v-divider>
                    </v-col>
                    <v-col cols="12" lg="7"> 这里是一个图表 </v-col>
                  </v-row>
                </v-container>
              </v-card>
              <v-card outlined class="mt-5">
                <v-card-title>学情分析</v-card-title>
                <v-divider></v-divider>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <!--  -->
                      这是一个图表，用来展示作业完成情况
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-sheet>
          </v-card>
        </v-col>
      </v-row>
      <v-overlay v-if="loading">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
        <div class="mx-auto">{{ loadingText }}</div>
      </v-overlay>
    </v-container>
  </div>
</template>

<script>
import Announcement from "@/components/CourseContentChildren/announcement.vue";
import ExamsView from "@/components/CourseContentChildren/examsView.vue";
import WorksView from "@/components/CourseContentChildren/worksView.vue";
import ReleaseWork from "@/components/CourseContentChildren/work/releaseWork.vue";
import Chart_sex from "@/components/CourseContentChildren/charts/chart_sex.vue";
import Chart_workScroe from "@/components/CourseContentChildren/charts/chart_workScroe.vue";
import WorksViewTeacher from "@/components/CourseContentChildren/worksViewTeacher.vue";
import ExamsViewTeacher from "@/components/CourseContentChildren/examsViewTeacher.vue";
import Announcement_release from "@/components/CourseContentChildren/announcement_release.vue";
import createKeyDialog from "../../components/comp/dialog/createKeyDialog.vue";
import {
  fun_getUsers,
  fun_getWorks,
  fun_getExams,
  fun_getAnnouncement,
  fun_getInfo,
  fun_removeUsers,
} from "@/api/course";

export default {
  components: {
    ExamsView,
    Announcement,
    WorksView,
    ReleaseWork,
    Chart_sex,
    Chart_workScroe,
    WorksViewTeacher,
    ExamsViewTeacher,
    Announcement_release,
    createKeyDialog,
  },
  data() {
    return {
      tab: null,
      items: ["作业", "考试", "公告", "成员"],
      usertable_headers: [
        {
          text: "学生姓名",
          align: "start",
          sortable: false,
          value: "username",
        },
        {
          text: "学号",
          align: "start",
          value: "uid",
        },
        {
          text: "作业平均分",
          align: "start",
          value: "workAverageScore",
        },
        {
          text: "完成作业数量",
          align: "start",
          value: "finishWorkNum",
        },
        {
          text: "移除该学生",
          value: "delete",
        },
      ],
      userinfos: [],
      pageOfUser: 1,
      pageCount: 0,
      cid: 0,
      loading_workview: false,
      loading_examview: false,
      loading_announcementview: false,
      works: [],
      exams: [],
      announcement: [],
      isTeacher: false,
      releaseWorkDialog: false,
      releaseAnnDialog: false,
      shareCourseDialog: false,
      loading: false,
      loadingText: "",
      searchIcon: "fa fa-user",
      finishGetUser: false,
      finishGetCourseInfo: true,
      CourseInfo: {},
      search_user: "",
      goExams: false,
      gotWorkScore: false,
      CourseStatsitics: {},
      submit_totalNum: 0,
      loading_summary: false,
      pageOfWorks: 1,
      pageOfExams: 1,
      page_lenOfWorks: 0,
      page_lenOfExams: 0,
    };
  },
  methods: {
    _alert(msg) {
      this.$toasted.show(msg, {
        theme: "outline",
        position: "top-center",
        duration: 2000,
      });
    },
    async close() {
      this.releaseWorkDialog = false;
      this.releaseAnnDialog = false;
      this.flushContent();
      this.getCourseInfo();
      this.getCourseStatsitics();
    },
    closeShareCourseDialog() {
      this.shareCourseDialog = false;
    },
    getCourseInfo() {
      let _this = this;
      _this.finishGetCourseInfo = false;
      fun_getInfo(this.cid)
        .then((res) => {
          _this.CourseInfo = JSON.parse(res.data);
          //   _this.CourseInfo = eval(res.data);
          _this.finishGetCourseInfo = true;
        })
        .catch((err) => {
          _this._alert("获取课程INFO失败：" + err);
        });
    },
    getCourseStatsitics() {
      //   let _this = this;
      //   const form = new FormData();
      //   form.append("cid", this.cid);
      //   _axios
      //     .post("/api/Course/getCourseStatistic", form)
      //     .then((res) => {
      //       _this.CourseStatsitics = eval(res.data.data);
      //       _this.gotExams = true;
      //       _this.gotWorkScore = true;
      //     })
      //     .catch((err) => {
      //       _this._alert("获取课程Statistics失败：" + err);
      //     });
    },
    getWorks(page) {
      let _this = this;
      _this.loading_workview = false;

      fun_getWorks(this.cid, page)
        .then((res) => {
          let dt = res.data;
          _this.works = dt;
          _this.page_lenOfWorks = res.code;
          _this.works.sort((a, b) => {
            return b.id - a.id;
          });
          _this.loading_workview = true;
          _this.loading = false;
          _this.loading_summary = false;
        })
        .catch((err) => {
          _this._alert("出问题咯，获取作业异常: " + err);
          _this.loading = false;
        });
    },
    getExams(page) {
      let _this = this;
      _this.loading_examview = false;

      fun_getExams(this.cid, page)
        .then((res) => {
          let dt = res.data;
          _this.exams = dt;
          _this.page_lenOfExams = res.code;

          _this.exams.sort((a, b) => {
            return b.id - a.id;
          });
          _this.loading_examview = true;
          _this.loading = false;
          _this.loading_summary = false;
        })
        .catch((err) => {
          _this._alert("出问题咯，获取作业异常: " + err);
          _this.loading = false;
        });
    },
    flushContent() {
      let _this = this;
      _this.finishGetUser = false;
      _this.loading_examview = false;
      _this.loading_workview = false;
      //   TODO 刷新时用户列表不会清除
      fun_getUsers(this.cid)
        .then((res) => {
          let arr = eval(res.data);
          _this.userinfos = [];

          arr = arr.sort((a, b) => {
            return Number(b.finishWorkNum) - Number(a.finishWorkNum);
          });
          arr.forEach((element, i) => {
            _this.userinfos[i] = element;
          });
          _this.finishGetUser = true;
          _this.loading = false;
        })
        .catch((err) => {
          _this._alert("出问题咯，获取班级成员异常: " + err);
          _this.loading = false;
          // _this.$router.replace({ path: "/Course" });
        });
      this.getWorks(1);
      this.getExams(1);
      fun_getAnnouncement(this.cid)
        .then((res) => {
          _this.loading_announcementview = true;
        })
        .catch((err) => {
          _this.loading_announcementview = false;
          _this._alert("出问题咯，获取公告异常: " + err);
        });
    },
    removeStu(uid) {
      let _this = this;
      this.$dialog({
        title: "Delete",
        content: "⚠ 删除后学生在班级里的作业记录无法恢复哦！请谨慎操作",
        btns: [
          {
            label: "确定",
            color: "#227bd4",
            callback: () => {
              fun_removeUsers(this.cid, uid).then((res) => {
                _this._alert(res.code);
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
    },
    createKeyForCourse() {
      let _this = this;
      let tim = "-";
      if (!Number.isNaN(this.keyLimitTime) && this.timelimit) {
        tim = this.keyLimitTime * 24 * 60 * 60;
        if (tim <= 0) {
          this._alert("请输入一个正确的时间!");
          return;
        } else {
        }
      }
      this.showKeyArea = true;
      fun_createKey(0, this.cid, tim).then((res) => {
        _this._alert(res.msg);
        _this.NewCourseKey = res.data;
        _this.finishGetKey = true;
        _this.showKeyArea = false;
      });
    },
  },
  mounted() {
    this.finishGetUser = false;
    this.loadingText = "正在获取作业 ...";
    this.loading = true;
    this.cid = this.$route.params.cid;
    if (this.cid == undefined) {
      this.cid = sessionStorage.getItem("temp_cid");
    } else {
      sessionStorage.setItem("temp_cid", this.cid);
    }
    this.loadingText = "正在准备权限信息 .. ";
    this.flushContent();
    this.getCourseInfo();
    this.getCourseStatsitics();
    this.isTeacher = window.localStorage.getItem("role") >= 1 ? true : false;
    this.items = this.isTeacher
      ? ["作业", "考试", "公告", "成员"]
      : ["作业", "考试", "公告"];
  },
  created() {
    // this.isTeacher
  },
};
</script>

<style>
.hideMore {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
