<template>
  <table class="table">
    <thead>
      <tr>
        <th v-for="(column, index) in columnNames" :key="index">{{ column }}</th>
        <th v-show="mainTable"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in items" :key="index">
        <td @click="toggleSelection(item)" v-for="(column, indexColumn) in columns" :key="indexColumn">
          {{ item[column] }}
        </td>
        <td v-show="showDelete" style="padding: 0px">
          <Button
            @click="onDelete(item.id)"
            id="delete"
            text="x"
            color="white"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template> 

<script>
import Button from "./Button.vue";

export default {
  name: "Table",
  components: {
    Button,
  },
  props: {
    items: Array,
    columns: Array,
    columnNames: Array,
    mainTable:Boolean,
    showDelete:Boolean
  },
  methods: {
    toggleSelection(item){
      this.$emit('select-item',item);
    },
    onDelete(id) {
      this.$emit("delete-item", id);
    },
  },
};
</script>

<style scoped>
button {
  width: 30px;
  font-size: 18px;
  padding: 0px;
  border-radius: 0px;
}
#delete {
  color: red;
}
tr{
  cursor: pointer;
}
table {
  box-shadow: 0px 0px 22px -9px rgba(66, 68, 90, 1);
  margin: 25px;
  display: inline-block;
  border-width: 1px;
  border-spacing: 0px;
  border-style: solid;
  border-color: darkgray;
  border-collapse: separate;
  background-color: white;
  user-select: none;
}
table th {
  border-width: 1px;
  padding: 3px;
  border-style: solid;
  border-color: darkgray;
  background-color: rgb(233, 233, 233);
}
table td {
  border-width: 1px;
  padding: 3px;
  border-style: solid;
  border-color: darkgray;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
}
</style>