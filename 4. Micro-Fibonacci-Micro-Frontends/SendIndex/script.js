new Vue({
    el: "#app",
    data: {
        number: 0,
    },
    methods: {
        async submit() {
            if (this.number > 250000) return;
            axios.post("/inp/api/idx", {
                idx: this.number
            })
                .then(() => {
                    this.number = 0;
                    this.poolAll();
                    this.poolCalculated();
                })
                .catch(() => { });
        }
    }
});