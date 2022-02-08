<template>
    <button :style="{background: color}">{{text}}</button>
</template>

<script>
export default{
    name: 'Button',
    props: {
        text:String,
        color: {
          default: 'rgb(0, 73, 18)'
        }
    }
}
</script>

<style scoped>

button {
  cursor: pointer;
  display: inline-block;
  background: rgb(0, 73, 18);
  border-radius: 0px 50px;
  width: 275px;
  color: white;
  font-size: 18px;
  border: 0;
  padding: 10px;
}

button:focus {
  outline: none;
}

button:hover {
  transform: scale(0.98);
}
</style>