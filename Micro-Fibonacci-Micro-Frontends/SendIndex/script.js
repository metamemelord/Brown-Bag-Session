new Vue({
    el: "#app",
    data: {
        number: 0,
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
                .catch(() => { });
        }
    }
});