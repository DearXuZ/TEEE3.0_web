<template>
  <v-card>
    <v-card-title>添加填空题</v-card-title>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-textarea
            filled
            label="输入题目内容"
            clearable
            no-resize
            rows="10"
            v-model="ans_text"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-container>
    <v-card-actions>
      <div style="width: 100px">
        <v-text-field
          label="分值"
          dense
          hint="请输入一个整数或Float"
          v-model="ans_score"
        ></v-text-field>
      </div>
      <v-spacer></v-spacer>
      <div style="width: 300px">
        <v-text-field
          label="正确答案"
          dense
          hint="用于自动批改"
          v-model="cans"
        ></v-text-field>
      </div>
      <span class="red--text">{{ this.msg }}</span>
      <v-spacer></v-spacer>

      <v-btn color="#b97a57" text @click="close()">算了</v-btn>
      <v-btn color="#b97a57" min-width="60px" class="white--text" @click="add()"
        >添加</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: ["defaultData", "qNum"],
  data() {
    return {
      ans_score: this.defaultData.qscore,
      ans_text: this.defaultData.qtext,
      cans: this.defaultData.cans,
      rules: {
        required: (value) => !!value || "不能为空！",
      },
      msg: "",
    };
  },
  methods: {
    close() {
      this.ans_score = "";
      this.ans_text = "";
      this.msg = "";
      this.cans = "";
      this.$emit("closeAddFillInQue", false);
    },
    add() {
      // 返回JSON
      //{qtype: 30011, qscore: 2.0,
      //qtext: "1111", cans: ""}
      console.log("props:" + this.qNum);

      if (this.ans_score == "") {
        this.msg = "分值不能为空";
        return;
      } else if (this.ans_text == "") {
        this.msg = "题目内容不能为空";
        return;
      } else if (this.cans == "") {
        this.msg = "请输入正确答案！若无标准答案，请发布简答题";
        return;
      } else if (isNaN(this.ans_score)) {
        this.msg = "请输入一个正确的分数!";
        return;
      }
      let newQue = {};
      newQue.qtype = 30011;
      newQue.qscore = this.ans_score;
      newQue.qtext = this.ans_text;
      newQue.cans = this.cans;
      this.cans = "";
      this.ans_score = "";
      this.ans_text = "";
      this.msg = "";

      this.$emit("addFillInQue", {
        newQue: newQue,
        qNum: this.qNum,
      });
    },
  },
};
</script>

<style scoped></style>
