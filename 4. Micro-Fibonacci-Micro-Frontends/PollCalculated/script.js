new Vue({
    el: "#app",
    data: {
        calculatedValues: [],
        intervalId: -1
    },
    methods: {
        async poolCalculated() {
            const response = await axios.get('/api/poll-calc');
            this.calculatedValues = response.data
        }
    },
    mounted() {
        this.poolCalculated()
        this.intervalId = setInterval(() => {
            this.poolCalculated()
        }, 2000);
    },
    beforeDestroy() {
        clearInterval(this.intervalId);
        this.intervalId = -1;
    }
});