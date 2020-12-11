<template>
    <h2>{{ time }}</h2>
</template>

<script>
export default {
    name: "TimeComponent",
    data: function() {
        return {
            time:`${this.getTime()}`
        }
    },
    created: function() {
        setInterval(() => {
            this.time = this.getTime()
        }, 1000);
    },
    methods: {
        setTime: function() {
            this.time = new Date().toUTCString()
        },
        getTime: function() {
            return new Date().toUTCString()
        }
    }
}
</script>