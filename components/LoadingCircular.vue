<template>
    <div class="text-center pa-0">
    <v-progress-circular
        :size="20"
        :width="3"
        indeterminate
        color="black"
    ></v-progress-circular>
    </div>
</template>

<script>
export default {
    name:'LoadingCircularComponent'
}
</script>