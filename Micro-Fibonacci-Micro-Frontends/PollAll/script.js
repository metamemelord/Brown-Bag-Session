new Vue({
    el: "#app",
    data: {
        enteredIndices: [],
        intervalId: -1
    },
    methods: {
        async poolAll() {
            const response = await axios.get('/api/poll-all');
            this.enteredIndices = response.data.map(number => number.number);
        }
    },
    mounted() {
        this.poolAll()
        this.intervalId = setInterval(() => {
            this.poolAll()
        }, 2000);
    },
    beforeDestroy() {
        clearInterval(this.intervalId);
        this.intervalId = -1;
    }
});