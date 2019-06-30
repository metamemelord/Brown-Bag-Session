new Vue({
    el: "#app",
    data: {
        number: 0,
        enteredIndices: [],
        calculatedValues: [],
        intervalId: -1
    },
    methods: {
        async submit() {
            if (this.number > 2000) return;
            axios.post("/api/idx", {
                    idx: this.number
                })
                .then(() => {
                    this.number = 0;
                    this.poolAll();
                    this.poolCalculated();
                })
                .catch(() => {});
        },
        async poolAll() {
            const response = await axios.get('/api/poll-all');
            this.enteredIndices = response.data.map(number => number.number);
        },
        async poolCalculated() {
            const response = await axios.get('/api/poll-calc');
            this.calculatedValues = response.data
        }
    },
    mounted() {
        this.poolAll()
        this.poolCalculated()
        this.intervalId = setInterval(() => {
            this.poolAll()
            this.poolCalculated()
        }, 2000);
    },
    beforeDestroy() {
        clearInterval(this.intervalId);
        this.intervalId = -1;
    }
});